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

    /**
     * @api {get} /api/todo get all todos
     * @apiName allTodos
     * @apiGroup Todo
     *
     * @apiSuccess {Object[]} todos         List of todos.
     * @apiSuccess {String}   todos.id      UUID ID of todo.
     * @apiSuccess {Integer}  todos.changed Last todo change in `time`.
     * @apiSuccess {Integer}  todos.created Todo creation in `time`.
     * @apiSuccess {String}   todos.text    Todo text.
     * @apiSuccess {Integer}  [todos.done]    Todo done in `time`.
     */
    public function allTodos(Request $request, Response $response): Response
    {
        $allTodos = $this->todoService->loadAllNotDeleted();
        $response = $response->withHeader('Content-Type','application/json');
        $response->getBody()->write(json_encode($allTodos));
        return $response;
    }

    /**
     * @api {post} /api/todo insert todo
     * @apiName insertTodo
     * @apiGroup Todo
     *
     * @apiParam {String} text Todo text.
     *
     * @apiError (422) 422 Validation error.
     * @apiError (500) 500 Persist error.
     *
     * @apiSuccess (201) 201 Success.
     * @apiSuccess (201) {text} Location URI of created todo (currently not implemented endpoint).
     */
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

    /**
     * @api {patch} /api/todo/:id patch todo
     * @apiName patchTodo
     * @apiGroup Todo
     *
     * @apiParam {String} id ID UUID.
     * @apiParam {String} text Todo text (in json body).
     * @apiParam {Boolean} done Todo done status (in json body).
     *
     * @apiError (422) 422 Validation error.
     * @apiError (404) 404 Todo with :id not found.
     * @apiError (500) 500 Persist error.
     *
     * @apiSuccess (202) 202 Successfully done.
     */
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