<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MyServicesController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $status = (string) $request->query('status', '');

        $query = Service::query()
            ->where('provider_id', $user->id)
            ->with([
                'category:id,name,slug',
                'city:id,name',
                'media:id,service_id,path,type,position',
            ])
            ->latest();

        if ($status !== '') {
            $query->where('status', $status);
        }

        $services = $query->paginate(12)->withQueryString();

        return Inertia::render('Provider/Services/Index', [
            'services' => $services,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $cities = City::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Provider/Services/Create', [
            'categories' => $categories,
            'cities' => $cities,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'title' => ['required', 'string', 'min:5', 'max:191'],
            'description' => ['required', 'string', 'min:10'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'pricing_type' => ['required', 'in:fixed,hourly,quote'],
            'payment_type' => ['required', 'in:cash,online,both'],
            'photos' => ['nullable', 'array', 'max:6'],
            'photos.*' => ['file', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ]);

        $baseSlug = Str::slug($data['title']);
        $slug = $baseSlug;

        $i = 2;
        while (Service::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$i;
            $i++;
        }

        $service = Service::create([
            'provider_id' => $user->id,
            'category_id' => $data['category_id'],
            'city_id' => $data['city_id'],
            'title' => $data['title'],
            'slug' => $slug,
            'description' => $data['description'],
            'base_price' => $data['base_price'] !== '' ? $data['base_price'] : null,
            'pricing_type' => $data['pricing_type'],
            'payment_type' => $data['payment_type'],
            'status' => 'pending',
        ]);

        if (! empty($data['photos'])) {
            foreach ($data['photos'] as $i => $file) {
                $path = $file->store("services/{$service->id}", 'public');

                $service->media()->create([
                    'path' => $path,
                    'type' => 'image',
                    'position' => $i,
                ]);
            }
        }

        return redirect()->route('provider.my.services.index')->with('success', 'Service created (pending approval)');

    }

    public function edit(Request $request, Service $service)
    {
        $user = $request->user();

        if ($service->provider_id !== $user->id) {
            abort(403);
        }

        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $cities = City::orderBy('name')->get(['id', 'name']);

        $service->load(['media:id,service_id,path,type,position']);

        return Inertia::render('Provider/Services/Edit', [
            'service' => $service,
            'categories' => $categories,
            'cities' => $cities,
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $user = $request->user();

        if ($service->provider_id !== $user->id) {
            abort(403);
        }

        $data = $request->validate([
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'city_id' => ['sometimes', 'integer', 'exists:cities,id'],
            'title' => ['sometimes', 'string', 'min:5', 'max:191'],
            'description' => ['sometimes', 'string', 'min:10'],
            'base_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'pricing_type' => ['sometimes', 'in:fixed,hourly,quote'],
            'payment_type' => ['sometimes', 'in:cash,online,both'],
            'remove_media_ids' => ['nullable', 'array'],
            'remove_media_ids.*' => [
                'integer',
                Rule::exists('service_media', 'id')->where(fn ($query) => $query->where('service_id', $service->id)),
            ],
            'cover_media_id' => [
                'nullable',
                'integer',
                Rule::exists('service_media', 'id')->where(fn ($query) => $query->where('service_id', $service->id)),
            ],
            'cover_new_photo_index' => ['nullable', 'integer', 'min:0'],
            'photos' => ['nullable', 'array', 'max:6'],
            'photos.*' => ['file', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ]);

        $updates = [
            'status' => 'pending',
        ];

        $updatableFields = [
            'category_id',
            'city_id',
            'title',
            'description',
            'base_price',
            'pricing_type',
            'payment_type',
        ];

        foreach ($updatableFields as $field) {
            if (array_key_exists($field, $data)) {
                $updates[$field] = $data[$field];
            }
        }

        $service->update($updates);

        if (! empty($data['remove_media_ids'])) {
            $mediaToDelete = $service->media()
                ->whereIn('id', $data['remove_media_ids'])
                ->get();

            foreach ($mediaToDelete as $media) {
                if ($media->path) {
                    Storage::disk('public')->delete($media->path);
                }
            }

            $service->media()->whereIn('id', $data['remove_media_ids'])->delete();
        }

        $createdMediaIds = [];

        if (! empty($data['photos'])) {
            $startPosition = (int) $service->media()->max('position');

            foreach ($data['photos'] as $i => $file) {
                $path = $file->store("services/{$service->id}", 'public');

                $newMedia = $service->media()->create([
                    'path' => $path,
                    'type' => 'image',
                    'position' => $startPosition + $i + 1,
                ]);

                $createdMediaIds[] = $newMedia->id;
            }
        }

        $coverMediaId = null;

        if (
            array_key_exists('cover_new_photo_index', $data) &&
            $data['cover_new_photo_index'] !== null
        ) {
            $coverNewPhotoIndex = (int) $data['cover_new_photo_index'];

            if (array_key_exists($coverNewPhotoIndex, $createdMediaIds)) {
                $coverMediaId = $createdMediaIds[$coverNewPhotoIndex];
            }
        }

        if (
            $coverMediaId === null &&
            array_key_exists('cover_media_id', $data) &&
            $data['cover_media_id'] !== null
        ) {
            $selectedCoverMediaId = (int) $data['cover_media_id'];
            $removedMediaIds = $data['remove_media_ids'] ?? [];

            if (! in_array($selectedCoverMediaId, $removedMediaIds, true)) {
                $coverMediaId = $selectedCoverMediaId;
            }
        }

        if ($coverMediaId !== null) {
            $mediaIds = $service->media()
                ->orderBy('position')
                ->orderBy('id')
                ->pluck('id')
                ->all();

            if (in_array($coverMediaId, $mediaIds, true)) {
                $orderedMediaIds = array_values(array_filter(
                    $mediaIds,
                    fn (int $mediaId) => $mediaId !== $coverMediaId
                ));
                array_unshift($orderedMediaIds, $coverMediaId);

                foreach ($orderedMediaIds as $position => $mediaId) {
                    $service->media()
                        ->whereKey($mediaId)
                        ->update(['position' => $position]);
                }
            }
        }

        return redirect()->route('provider.my.services.index')->with('success', 'Service updated (pending approval)');
    }

    public function destroy(Request $request, Service $service)
    {
        $user = $request->user();

        if ($service->provider_id !== $user->id) {
            abort(403);
        }

        $service->delete();

        return redirect()->route('provider.my.services.index')->with('success', 'Service removed successfully.');
    }
}
