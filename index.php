<?php

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\Factory\AppFactory;
use Slim\Views\Twig;
use Slim\Views\TwigMiddleware;

require_once 'vendor/autoload.php';

\Tracy\Debugger::enable();

// Create Container
$container = new \DI\Container();
AppFactory::setContainer($container);


// Set view in Container
$container->set('twig', function() {
    return Twig::create('templates');
});

$app = AppFactory::create();
$app->add(TwigMiddleware::createFromContainer($app, 'twig'));
$app->get('/', function (Request $request, Response $response, array $args) {
    $this->get('twig')->render($response, 'index.twig');
    return $response;
});
$app->run();