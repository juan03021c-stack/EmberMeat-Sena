<?php

require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

/* Envía un correo desde el Gmail de la tienda (Config/Correo.php).
   Si falla solo deja el error en el log, para no dañar el pedido. */
function enviarCorreo($para, $nombre, $asunto, $html)
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
        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body    = $html;

        return $mail->send();
    } catch (Exception $e) {
        error_log('No se pudo enviar el correo "' . $asunto . '": ' . $e->getMessage());
        return false;
    }
}
