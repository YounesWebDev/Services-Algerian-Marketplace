<?php

namespace App\Http\Requests\Settings;

use App\Http\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:191'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:191',
                Rule::unique('users', 'email')->ignore($this->user()->id),
            ],
            'bio' => ['nullable', 'string', 'max:2000'],
            'address' => ['nullable', 'string', 'max:191'],
            'company_name' => ['nullable', 'string', 'max:191'],
            'avatar' => ['nullable', 'file', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ];
    }
}
