<?php

require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

/* Envía un correo desde el Gmail de la tienda (Config/Correo.php).
   Si falla solo deja el error en el log, para no dañar el pedido. */
function enviarCorreo($para, $nombre, $asunto, $html, $copiasOcultas = [])
{
    $configCorreo = __DIR__ . '/Correo.php';
    if (!file_exists($configCorreo)) {
        return false;
    }
    require_once $configCorreo;

    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_USER;
        $mail->Password   = MAIL_PASS;
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;
        $mail->Timeout    = 10;
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom(MAIL_USER, 'EmberMeat');
        $mail->addAddress($para, $nombre);
        foreach ($copiasOcultas as $correo) {
            $mail->addBCC($correo);
        }
        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body    = plantillaCorreo($html);
        $mail->AltBody = trim(html_entity_decode(strip_tags(str_replace(['<br>', '</p>', '</h2>', '</li>'], "\n", $html)), ENT_QUOTES, 'UTF-8'));

        return $mail->send();
    } catch (Exception $e) {
        error_log('No se pudo enviar el correo "' . $asunto . '": ' . $e->getMessage());
        return false;
    }
}

/* Marco con los colores de la tienda; estilos en línea porque Gmail ignora <style> */
function plantillaCorreo($contenido)
{
    return '<div style="background:#f3f4f6;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">'
        . '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">'
        . '<div style="background:#1f2937;padding:18px 24px;color:#ffffff;font-size:22px;font-weight:bold">'
        . 'Ember<span style="color:#ea580c">Meat</span></div>'
        . '<div style="padding:24px;color:#374151;font-size:15px;line-height:1.5">' . $contenido . '</div>'
        . '<div style="background:#f9fafb;padding:14px 24px;color:#9ca3af;font-size:12px;text-align:center">'
        . 'EmberMeat · <a href="https://embermeat.site" style="color:#c2410c">embermeat.site</a><br>'
        . 'Este es un correo automático, por favor no lo respondas.</div>'
        . '</div></div>';
}
