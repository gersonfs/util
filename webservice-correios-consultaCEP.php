<?php

$action = 'consultaCEP';

$soap_msg  = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cli="http://cliente.bean.master.sigep.bsb.correios.com.br/">
 <soapenv:Header/>
 <soapenv:Body>
 <cli:consultaCEP>
 <cep>96830770</cep>
 </cli:consultaCEP>
 </soapenv:Body>
</soapenv:Envelope>';

$headers = array(
    "Content-type: text/xml;charset=\"utf-8\"",
    "Accept: text/xml",
    "Cache-Control: no-cache",
    "Pragma: no-cache",    
    "Content-length: " . mb_strlen($soap_msg),
    "User-Agent: LivreGestao/1.0"
);       

$urlWebService = 'https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente';
$soap_do = curl_init();
curl_setopt($soap_do, CURLOPT_URL, $urlWebService);
curl_setopt($soap_do, CURLOPT_CONNECTTIMEOUT, 40);
curl_setopt($soap_do, CURLOPT_TIMEOUT, 86400);
curl_setopt($soap_do, CURLOPT_RETURNTRANSFER, true);
curl_setopt($soap_do, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($soap_do, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($soap_do, CURLOPT_POST, true);
curl_setopt($soap_do, CURLOPT_POSTFIELDS, $soap_msg);
curl_setopt($soap_do, CURLOPT_HTTPHEADER, $headers);


$response = curl_exec($soap_do);

$p1 = mb_strpos($response, '<return>');
$p2 = mb_strpos($response, '</return>') + 9;
$conteudo = mb_substr($response, $p1, $p2 - $p1);

$xml = new SimpleXMLElement($conteudo);
$json = json_encode($xml);
$array = json_decode($json,TRUE);

print_r($array);
/*echo (string)$s->bairro . "\n";
echo (string)$s->cep . "\n";
echo (string)$s->cidade . "\n";
echo (string)$s->complemento . "\n";
echo (string)$s->end . "\n";
echo (string)$s->uf . "\n";*/