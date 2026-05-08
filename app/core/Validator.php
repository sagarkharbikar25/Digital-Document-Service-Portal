<?php

class Validator
{
    private static $errors = [];

    public static function validate($data, $rules)
    {
        self::$errors = [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $ruleList = explode('|', $fieldRules);

            foreach ($ruleList as $rule) {
                if ($rule === 'required') {
                    if (empty($value) && $value !== '0' && $value !== 0) {
                        self::$errors[$field] = ucfirst($field) . " is required.";
                        break;
                    }
                } elseif ($rule === 'email') {
                    if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        self::$errors[$field] = "Invalid email format.";
                    }
                } elseif ($rule === 'numeric') {
                    if ($value && !is_numeric($value)) {
                        self::$errors[$field] = ucfirst($field) . " must be numeric.";
                    }
                } elseif (strpos($rule, 'min:') === 0) {
                    $min = (int)substr($rule, 4);
                    if ($value && strlen($value) < $min) {
                        self::$errors[$field] = ucfirst($field) . " must be at least $min characters.";
                    }
                } elseif (strpos($rule, 'max:') === 0) {
                    $max = (int)substr($rule, 4);
                    if ($value && strlen($value) > $max) {
                        self::$errors[$field] = ucfirst($field) . " cannot exceed $max characters.";
                    }
                }
            }
        }

        return empty(self::$errors);
    }

    public static function getErrors()
    {
        return self::$errors;
    }

    public static function required($data, $fields)
    {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return false;
            }
        }
        return true;
    }
}