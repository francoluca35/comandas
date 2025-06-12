import {
    const { default: clientPromise } = await import('@/lib/mongodb'); NextResponse } from "next/server";
export async function GET() {
  const client = await clientPromise;
  const db = client.db("comandas");
  const productos = await db.collection("menus").find().toArray();
  return NextResponse.json(productos);
}