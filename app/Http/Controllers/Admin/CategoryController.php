<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    // 1) show page + send data
    public function index()
    {

        $categories = Category::with('parent:id,name')->orderBy('name')->get(['id', 'name', 'parent_id', 'slug']);
        $parents = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'parents' => $parents,
        ]);
    }

    // 2) create
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:categories,id'],
        ]);

        // prevent duplicate : same name + same parent
        $exists = Category::where('name', $data['name'])
            ->where('parent_id', $data['parent_id'] ?? null)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'name' => 'This category already exists under the same parent.',
            ]);
        }

        $data['slug'] = $this->uniqueSlug($data['name']);

        Category::create($data);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category Created Successfully');
    }

    // 3) Update
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:categories,id'],
        ]);

        // cannot be its own parent
        if (! empty($data['parent_id']) && (int) $data['parent_id'] === (int) $category->id) {
            return back()->withErrors([
                'parent_id' => 'A category cannot be its own parent.',
            ]);
        }

        // prevent duplicate excluding current category
        $exists = Category::where('id', '!=', $category->id)
            ->where('name', $data['name'])
            ->where('parent_id', $data['parent_id'] ?? null)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'name' => 'This category already exists under the same parent.',
            ]);
        }

        $category->update($data);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category Updated Successfully');
    }

    // 4) delete
    public function destroy(Category $category)
    {
        $hasChildren = Category::where('parent_id', $category->id)->exists();
        if ($hasChildren) {
            return back()->withErrors([
                'error' => 'Cannot delete category with subcategories',
            ]);
        }

        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category Deleted Successfully.');
    }

    private function uniqueSlug(string $name, ?int $ignoredId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 1;
        while (true) {
            $q = Category::where('slug', $slug);
            if ($ignoredId) {
                $q->where('id', '!=', $ignoredId);
            }
            if (! $q->exists()) {
                return $slug;
            }
            $slug = $base.'-'.$counter;
            $counter++;
        }
    }
}
