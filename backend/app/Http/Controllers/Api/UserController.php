<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')
            ->latest()
            ->get()
            ->map(fn (User $user) => $this->userWithRole($user));

        return response()->json([
            'data' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'min:6'],
                'role_id' => ['required', 'exists:roles,id'],
            ],
            [
                'email.unique' => 'Email này đã tồn tại.',
            ],
        );

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $role = Role::findOrFail($data['role_id']);
        $user->syncRoles([$role->name]);

        return response()->json([
            'message' => 'User created successfully',
            'data' => $this->userWithRole($user->fresh()),
        ], 201);
    }

    public function show(User $user)
    {
        return response()->json([
            'data' => $this->userWithRole($user),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate(
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email')->ignore($user->id),
                ],
                'password' => ['nullable', 'string', 'min:6'],
                'role_id' => ['required', 'exists:roles,id'],
            ],
            [
                'email.unique' => 'Email này đã tồn tại.',
            ],
        );

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        $role = Role::findOrFail($data['role_id']);
        $user->syncRoles([$role->name]);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $this->userWithRole($user->fresh()),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->is($user)) {
            return response()->json([
                'message' => 'Cannot delete your own account',
            ], 403);
        }

        $user->tokens()->delete();
        $user->syncRoles([]);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    public function assignRoles(Request $request, User $user)
    {
        $data = $request->validate([
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        $role = Role::findOrFail($data['role_id']);

        $user->syncRoles([$role->name]);

        return response()->json([
            'message' => 'Role assigned successfully',
            'role' => $role,
            'data' => $this->userWithRole($user->fresh()),
        ]);
    }

    private function userWithRole(User $user): array
    {
        $user->loadMissing('roles');

        $role = $user->roles->first();

        return array_merge(
            $user->makeHidden('roles')->toArray(),
            [
                'role' => $role ? $role->makeHidden('pivot')->toArray() : null,
            ]
        );
    }
}
