import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IncomingForm } from "formidable";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import stream from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Convertir Request de Next.js a stream tipo Node
async function streamToNodeReadable(readableStream) {
  const reader = readableStream.getReader();
  return new stream.Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) this.push(null);
      else this.push(value);
    },
  });
}

export async function POST(req) {
  try {
    const nodeReq = await streamToNodeReadable(req.body);
    nodeReq.headers = Object.fromEntries(req.headers.entries());
    nodeReq.method = req.method;

    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm({ keepExtensions: true });
      form.parse(nodeReq, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { fields, files } = data;

    const id = fields.id?.[0];
    const nombre = fields.nombre?.[0];
    const tipo = fields.tipo?.[0];
    const precio = parseFloat(fields.precio?.[0]);
    const precioConIVA = parseFloat(fields.precioConIVA?.[0]);
    const descuento = fields.descuento?.[0]
      ? parseFloat(fields.descuento?.[0])
      : 0;
    const adicionales = fields.adicionales?.[0]
      ? JSON.parse(fields.adicionales[0])
      : [];

    if (!id || !nombre || isNaN(precio) || isNaN(precioConIVA)) {
      return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
    }

    const update = {
      nombre,
      tipo,
      precio,
      precioConIVA,
      descuento,
      ...(tipo === "comida" && { adicionales }),
    };

    if (files.imagen?.[0]) {
      const file = files.imagen[0];
      const extension = path.extname(file.originalFilename);
      const newName = `${Date.now()}${extension}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", newName);
      await writeFile(uploadPath, fs.readFileSync(file.filepath));
      update.imagen = `/uploads/${newName}`;
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    await db
      .collection("menus")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    return NextResponse.json({ message: "Menú actualizado correctamente" });
  } catch (error) {
    console.error("Error al editar menú:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
