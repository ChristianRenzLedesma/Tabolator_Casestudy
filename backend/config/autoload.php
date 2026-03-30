<?php

/**
 * Custom autoloader using spl_autoload_register
 */
spl_autoload_register(function ($className) {
    // Debug logging
    error_log("Autoloader trying to load: " . $className);
    
    // Convert namespace to file path
    $className = ltrim($className, '\\');
    $fileName = '';
    $namespace = '';
    
    if ($lastNsPos = strrpos($className, '\\')) {
        $namespace = substr($className, 0, $lastNsPos);
        $className = substr($className, $lastNsPos + 1);
        $fileName = str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
    }
    
    $fileName .= str_replace('_', DIRECTORY_SEPARATOR, $className) . '.php';
    
    // Base directory for classes
    $baseDir = __DIR__ . '/../src/';
    $filePath = $baseDir . $fileName;
    
    error_log("Looking for file: " . $filePath);
    
    if (file_exists($filePath)) {
        error_log("File found, requiring: " . $filePath);
        require $filePath;
        return true;
    }
    
    error_log("File not found: " . $filePath);
    return false;
});

// Optional: Also load from models directory for backward compatibility
spl_autoload_register(function ($className) {
    $modelsDir = __DIR__ . '/../models/';
    $filePath = $modelsDir . $className . '.php';
    
    if (file_exists($filePath)) {
        require $filePath;
        return true;
    }
    
    return false;
});
