<?php

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\Factory\AppFactory;
use Tudlu\Api\Controller\TodoController;

require_once '../vendor/autoload.php';

// Create and configure Container
$container = new \DI\Container();

$container->set('sqlitePath', DI\env('TUDLU_SQLITE_DB_PATH'));

$container->set(\Dibi\Connection::class, function(\Psr\Container\ContainerInterface $container) {
    $filePath = $container->get('sqlitePath');
    return new \Dibi\Connection([
        'driver' => 'sqlite',
        'file' => $filePath
    ]);
});

$container->set(
    \Ramsey\Uuid\UuidFactoryInterface::class,
    DI\create(\Ramsey\Uuid\UuidFactory::class)
);

AppFactory::setContainer($container);

$app = AppFactory::create();
$app->get('/api/todo', function (Request $request, Response $response, array $args) {
    return $this->get(TodoController::class)->allTodos($request, $response);
});
$app->post('/api/todo', function (Request $request, Response $response, array $args) {
    return $this->get(TodoController::class)->insertTodo($request, $response);
});
$app->patch('/api/todo/{id}', function (Request $request, Response $response, array $args) {
    return $this->get(TodoController::class)->patchTodo($request, $response, $args);
});
$app->run();