<?php

class TestController
{

    public function test()
    {
        echo json_encode([
            "status" => "success",
            "message" => "API working successfully"
        ]);
    }

}