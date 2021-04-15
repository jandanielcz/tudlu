<?php
namespace Tudlu\Api\Controller;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Tudlu\Api\Model\Todo;
use Tudlu\Api\Service\TodoService;

class TodoController
{
    protected TodoService $todoService;

    public function __construct(TodoService $todoService)
    {
        $this->todoService = $todoService;
    }

    public function allTodos(Request $request, Response $response): Response
    {
        $allTodos = $this->todoService->loadAllNotDeleted();
        $response = $response->withHeader('Content-Type','application/json');
        $response->getBody()->write(json_encode($allTodos));
        return $response;
    }

    public function insertTodo(Request $request, Response $response): Response
    {
        $body = $request->getBody()->getContents();
        $body = json_decode($body);
        if (!$this->isValidInsert($body)) {
            return $response->withStatus(422);
        }
        $result = $this->todoService->insertTodo($body->text);
        if ($result instanceof Todo) {
            return $response->withStatus(201)
                            ->withHeader('Location', sprintf('/api/todo/%s', $result->id));
        }
        return $response->withStatus(500);
    }

    public function patchTodo(Request $request, Response $response, array $args): Response
    {
        $id = $args['id'];
        $body = $request->getBody()->getContents();
        $body = json_decode($body);
        if (!$this->isValidPatch($body)) {
            return $response->withStatus(422);
        }
        $todo = $this->todoService->getSingle($id);
        if (!$todo) {
            return $response->withStatus(404);
        }
        if (isset($body->done)) {
            if ($body->done === true) {
                $todo->done = time();
            } else {
                $todo->done = null;
            }
        }
        if (isset($body->text) && mb_strlen($body->text) > 0) {
            $todo->text = $body->text;
        }
        $result = $this->todoService->saveTodo($todo);
        if ($result instanceof Todo) {
            return $response->withStatus(202);
        }
        return $response->withStatus(500);
    }

    protected function isValidInsert(\stdClass|null $body): bool
    {
        return ($body !== null && isset($body->text) && mb_strlen($body->text) > 0);
    }

    protected function isValidPatch(\stdClass|null $body): bool
    {
        return ($body !== null && isset($body->done) || $body !== null && isset($body->text));
    }
}