<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    //show all categories (Admin page)
    public function index(){

    $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Categories/Index',[
            'categories' => $categories,
        ]);
    }

    //show create form
    public function create(){

        $parents = Category::orderBy('name')->get(['id','name']);

        return Inertia::render('Admin/Categories/Create',[
            'parents' => $parents
        ]);
    }

    //save category into DB
    public function store(Request $request){
        $data = $request->validate([
            'name' => ['required' , 'string' , 'max:255'],
            'parent_id' => ['nullable' , 'exists:categories,id'],
        ]);
    }
    
}
