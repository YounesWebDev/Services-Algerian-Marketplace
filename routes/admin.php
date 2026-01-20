<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth','verified','role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (){

        Route::get('/dashboard' , function (){
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard');
        
    });