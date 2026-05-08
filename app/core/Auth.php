<?php

require_once __DIR__ . "/Session.php";

class Auth
{

    public static function login($user)
    {
        Session::start();

        Session::set("user_id", $user["id"]);
        Session::set("role", $user["role"]);
    }

    public static function user()
    {
        Session::start();

        return Session::get("user_id");
    }

    public static function role()
    {
        Session::start();

        return Session::get("role");
    }

    public static function logout()
    {
        Session::destroy();
    }

}