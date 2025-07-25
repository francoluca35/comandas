export function validarRegistro({ username, password, foto }) {
  const errores = {};

  // 1. Usuario: máximo 15 caracteres
  if (!username || username.length < 8 || username.length > 15) {
    errores.username =
      "El nombre de usuario debe tener entre 8 y 15 caracteres.";
  }

  // 2. Contraseña: 8-20 caracteres y requisitos de seguridad
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-])[A-Za-z\d@$!%*?&._\-]{8,50}$/;

  if (!passwordRegex.test(password || "")) {
    errores.password =
      "La contraseña debe tener entre 8 y 20 caracteres, incluyendo al menos una mayúscula, una minúscula, un número y un símbolo.";
  }

  // 3. Imagen: tamaño máximo 2MB
  if (foto && foto.size > 1 * 1024 * 1024) {
    errores.foto = "La imagen no debe pesar más de 1MB.";
  }

  return errores;
}
