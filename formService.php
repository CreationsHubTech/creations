<?php
// formService.php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Função para sanitizar dados
function sanitizeInput($data)
{
  return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Decodifica os dados JSON recebidos
  $jsonData = file_get_contents('php://input');
  $formData = json_decode($jsonData, true);

  // Valida e sanitiza os dados
  $name = isset($formData['name']) ? sanitizeInput($formData['name']) : null;
  $phone = isset($formData['phone']) ? sanitizeInput($formData['phone']) : null;
  $email = isset($formData['email']) ? filter_var($formData['email'], FILTER_SANITIZE_EMAIL) : null;
  $branch = isset($formData['branch']) ? sanitizeInput($formData['branch']) : null;

  // Verifica se todos os campos estão preenchidos
  if ($name && $phone && $email && $branch) {
    // Configura o PHPMailer
    $mail = new PHPMailer(true);

    try {
      // Configurações do servidor SMTP
      $mail->isSMTP();
      $mail->Host = 'smtp.gmail.com';
      $mail->SMTPAuth = true;
      $mail->Username = $_ENV['EMAIL_ADDRESS'];; // Substitua pelo seu email do Gmail
      $mail->Password = $_ENV['EMAIL_PASSWORD'];; // Substitua pela sua senha do Gmail ou senha de app
      $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
      $mail->Port = 587;
      $mail->CharSet = 'UTF-8';

      // Remetente e destinatário
      $mail->setFrom('creationshub.tech@gmail.com', 'Formulário de Contato');
      $mail->addAddress('creationshub.tech@gmail.com', 'CreationsHub');

      // Conteúdo do email
      $mail->isHTML(true);
      $mail->Subject = 'Nova mensagem do formulário de serviço';
      $mail->Body = "
                <h1>Nova mensagem recebida</h1>
                <p><strong>Nome:</strong> $name</p>
                <p><strong>Telefone:</strong> $phone</p>
                <p><strong>Email:</strong> $email</p>
                <p><strong>Ramo da empresa:</strong> $branch</p>
            ";
      $mail->AltBody = "
                Nome: $name\n
                Telefone: $phone\n
                Email: $email\n
                Ramo da empresa: $branch\n
            ";

      // Envia o email
      $mail->send();
      echo json_encode(['success' => true, 'message' => 'Email enviado com sucesso!']);
    } catch (Exception $e) {
      echo json_encode(['success' => false, 'message' => 'Erro ao enviar o email: ' . $mail->ErrorInfo]);
    }
  } else {
    echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']);
  }
} else {
  echo json_encode(['success' => false, 'message' => 'Método de requisição inválido.']);
}
