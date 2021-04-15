<?php
namespace Tudlu\Api\Service;

use Dibi\Connection;
use Dibi\Row;
use JetBrains\PhpStorm\Pure;
use Ramsey\Uuid\UuidFactoryInterface;
use Tudlu\Api\Model\Todo;

class TodoService
{
    private string $tableName = 'todo';

    public function __construct(
        protected Connection $connection,
        protected UuidFactoryInterface $uuidFactory
    ){}

    /**
     * @return Todo[]
     */
    public function loadAllNotDeleted(): array
    {
        if (!$this->doesTableExist()){
            return [];
        }
        $q = [
            'select * from %n', $this->tableName,' where removed is null order by changed desc'
        ];
        $r = $this->connection->query($q)->fetchAll();
        return $this->mapRows($r);
    }

    public function getSingle(string $id): Todo|null
    {
        if (!$this->doesTableExist()){
            return null;
        }
        $q = [
            'select * from %n', $this->tableName,' where removed is null and id = %s', $id
        ];
        $r = $this->connection->query($q)->fetch();
        if ($r === null) {
            return null;
        }
        return $this->mapRow($r);
    }

    public function insertTodo(string $text): Todo|null
    {
        if (!$this->doesTableExist()) {
            $this->createTable();
        }
        $created = time();
        $id = $this->uuidFactory->uuid4()->toString();
        $q = [
            'insert into %n (id, text, created, changed) values (%s, %s, %i, %i)',
            $this->tableName,
            $id,
            $text,
            $created,
            $created
        ];
        $res = $this->connection->query($q);
        if ($res->rowCount === 1) {
            return new Todo($id, $text, $created, $created);
        }
        return null;
    }

    public function saveTodo(Todo $todo): Todo|null
    {
        if (!$this->doesTableExist()) {
            $this->createTable();
        }
        $changed = time();
        $q = [
            'update %n set text=%s, removed=%i, done=%i, changed=%i',
            $this->tableName,
            $todo->text,
            $todo->removed ?? null,
            $todo->done ?? null,
            $changed,
            'where id = %s', $todo->id
        ];
        $res = $this->connection->query($q);
        if ($res->rowCount === 1) {
            $todo->changed = $changed;
            return $todo;
        }
        return null;
    }

    protected function mapRows(array $rows): array
    {
        return array_map([$this, 'mapRow'], $rows);
    }

    protected function mapRow(Row $row): Todo
    {
        $todo = new Todo($row->id, $row->text, $row->created, $row->changed);
        if ($row->done) {
            $todo->done = (int)$row->done;
        }
        if ($row->removed) {
            $todo->removed = (int)$row->removed;
        }
        return $todo;
    }

    protected function doesTableExist(): bool
    {
        $q = [
            'SELECT name FROM sqlite_master WHERE type="table" AND name=%s', $this->tableName
        ];
        $r = $this->connection->query($q)->fetchSingle();
        return ($r !== null);
    }

    protected function createTable(): void
    {
        $q = [
            'create table %n (', $this->tableName,
                'id string primary key,',
                'text string,',
                'created int,',
                'changed int,',
                'done int,',
                'removed int',
            ')'
        ];
        $this->connection->query($q);
    }
}