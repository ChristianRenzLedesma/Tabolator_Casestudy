<?php

namespace Tabolator\Models;

class User {
    private $dataFile;
    private $users;
    private $nextId;
    
    public function __construct() {
        $this->dataFile = __DIR__ . '/../../data/users.json';
        $this->loadData();
    }
    
    private function loadData() {
        if (file_exists($this->dataFile)) {
            $data = json_decode(file_get_contents($this->dataFile), true);
            $this->users = $data['users'] ?? [];
            $this->nextId = $data['nextId'] ?? 1;
        } else {
            $this->users = [
                ['id' => 1, 'name' => 'John', 'age' => 30],
                ['id' => 2, 'name' => 'Jane', 'age' => 22],
                ['id' => 3, 'name' => 'Bob', 'age' => 35]
            ];
            $this->nextId = 4;
            $this->saveData();
        }
    }
    
    private function saveData() {
        $data = [
            'users' => $this->users,
            'nextId' => $this->nextId
        ];
        $dir = dirname($this->dataFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents($this->dataFile, json_encode($data, JSON_PRETTY_PRINT));
    }

    public function getAllUsers() {
        return [
            'success' => true,
            'data' => $this->users
        ];
    }

    public function getUserById($id) {
        foreach ($this->users as $user) {
            if ($user['id'] == $id) {
                return [
                    'success' => true,
                    'data' => $user
                ];
            }
        }
        return [
            'success' => false,
            'message' => 'User not found'
        ];
    }

    public function createUser($data) {
        $newUser = [
            'id' => $this->nextId++,
            'name' => $data['name'] ?? '',
            'age' => $data['age'] ?? 0
        ];
        
        if (!empty($newUser['name'])) {
            $this->users[] = $newUser;
            $this->saveData();
            
            return [
                'success' => true,
                'data' => $newUser,
                'message' => 'User created successfully'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Name is required'
            ];
        }
    }

    public function updateUser($id, $data) {
        foreach ($this->users as &$user) {
            if ($user['id'] == $id) {
                if (isset($data['name'])) $user['name'] = $data['name'];
                if (isset($data['age'])) $user['age'] = $data['age'];
                $this->saveData();
                
                return [
                    'success' => true,
                    'data' => $user,
                    'message' => 'User updated successfully'
                ];
            }
        }
        
        return [
            'success' => false,
            'message' => 'User not found'
        ];
    }

    public function deleteUser($id) {
        foreach ($this->users as $key => $user) {
            if ($user['id'] == $id) {
                unset($this->users[$key]);
                $this->users = array_values($this->users);
                $this->saveData();
                
                return [
                    'success' => true,
                    'message' => 'User deleted successfully'
                ];
            }
        }
        
        return [
            'success' => false,
            'message' => 'User not found'
        ];
    }
}
