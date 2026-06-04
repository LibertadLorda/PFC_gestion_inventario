// Tests unitarios para probar la seguridad del backend
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Cifrado de contraseñas con bcrypt', () => {

  test('bcrypt.compare devuelve true para la contraseña correcta', async () => {
    const password = 'contraseñaCorrecta123';
    const hash = await bcrypt.hash(password, 10);
    const resultado = await bcrypt.compare(password, hash);
    expect(resultado).toBe(true);
  });

  test('bcrypt.compare devuelve false para una contraseña incorrecta', async () => {
    const password = 'contraseñaIncorreta';
    const otra = 'contraseñaErronea';
    const hash = await bcrypt.hash(password, 10);
    const resultado = await bcrypt.compare(otra, hash);
    expect(resultado).toBe(false);
  });
});

describe('Generación y validación de tokens JWT', () => {

  test('Un token firmado se valida correctamente y recupera el payload', () => {
    const secret = 'prueba_clave_secreta';
    const payload = { id: 1, name: 'Libertad', role: 'admin', company_id: 5 };
    const token = jwt.sign(payload, secret, { expiresIn: '8h' });
    const decoded = jwt.verify(token, secret);
    expect(decoded.id).toBe(1);
    expect(decoded.name).toBe('Libertad');
    expect(decoded.role).toBe('admin');
    expect(decoded.company_id).toBe(5);
  });

  test('La validación falla si se utiliza una clave secreta distinta', () => {
    const secret = 'prueba_clave_secreta';
    const claveIncorrecta = 'prueba_clave_incorrecta';
    const token = jwt.sign({ id: 1 }, secret);
    expect(() => jwt.verify(token, claveIncorrecta)).toThrow();
  });
});
