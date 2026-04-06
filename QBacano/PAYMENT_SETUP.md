# Configuración de APIs de Pago - QBacano

## 🔑 Claves de Prueba Configuradas

### Mercado Pago
- **Public Key**: `TEST-1234567890123456-123456-1234567890123456789012345678901234567890`
- **Access Token**: `TEST-123456789012345678901234567890-123456789`
- **Modo**: Sandbox/Test

> Nota: Mercado Pago requiere un token de acceso de prueba válido y normalmente debe generarse desde tu cuenta de sandbox de Mercado Pago. Si usas un token inválido, la creación de la preferencia fallará y se mostrará un error.

### PayPal
- **Client ID**: `sb`
- **Modo**: Sandbox (genérico)
- **Moneda**: USD

## 🧪 Cómo Probar los Pagos

1. **Accede a la aplicación**: http://localhost:8000
2. **Agrega productos al carrito**
3. **Ve a la sección de pagos**
4. **Prueba Mercado Pago**: Se abrirá en una nueva ventana con datos de prueba
5. **Prueba PayPal**: Aparecerá un modal con el botón de PayPal

## 📋 Datos de Prueba

### Mercado Pago
- **Tarjetas de prueba**:
  - Visa: 4509 9535 6623 3704
  - MasterCard: 5031 4332 1540 6351
  - American Express: 3711 8030 3257 739
- **Código de seguridad**: 123
- **Fecha de vencimiento**: 11/25

### PayPal
- **Cuenta de prueba**: Crea una cuenta en https://developer.paypal.com/
- **Email de prueba**: buyer@example.com
- **Contraseña**: Usar cuenta sandbox

## ⚠️ Importante

Estas son claves de **PRUEBA** únicamente. Para producción necesitarás:

1. **Cuenta real en Mercado Pago**: https://www.mercadopago.com.ar/developers
2. **Cuenta real en PayPal**: https://developer.paypal.com/
3. **Reemplazar las claves de prueba** con las claves de producción
4. **Configurar webhooks** para confirmación de pagos

## 🔄 Próximos Pasos

1. Probar las integraciones con datos de prueba
2. Configurar cuentas reales cuando estés listo para producción
3. Implementar manejo de estados de pago (pendiente, aprobado, rechazado)
4. Agregar confirmación de pedidos por email/WhatsApp

## 📞 Soporte

- Mercado Pago: https://www.mercadopago.com.ar/developers
- PayPal: https://developer.paypal.com/docs/</content>
<parameter name="filePath">d:\recap_programacion\QBacano\PAYMENT_SETUP.md