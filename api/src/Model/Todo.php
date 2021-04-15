<?php


namespace Tudlu\Api\Model;


class Todo
{
    public int|null $done;
    public int|null $removed;

    public function __construct(
        public string $id,
        public string $text,
        public int $created,
        public int $changed,
    ){}

}