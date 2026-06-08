<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function assignPermissions(Request $request, $roleId)
    {
        $data = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $role = Role::findOrFail($roleId);
        $role->syncPermissions($data['permissions']);

        return response()->json([
            'message' => 'Assign permissions to role successfully',
            'data' => $role->load('permissions'),
        ]);
    }
    public function index()
    {
        $roles = Role::with('permissions')
            ->latest()
            ->get();

        return response()->json([
            'data' => $roles
        ]);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'web',
        ]);

        if (!empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return response()->json([
            'message' => 'Role created successfully',
            'data' => $role->load('permissions')
        ], 201);
    }

    public function show(string $id)
    {
        $role = Role::with('permissions')->findOrFail($id);

        return response()->json([
            'data' => $role
        ]);
    }

    public function update(Request $request, string $id)
    {
        $role = Role::findOrFail($id);

        $data = $request->validate([
            'name' => ['required', 'string', 'unique:roles,name,' . $role->id],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->update([
            'name' => $data['name'],
        ]);

        $role->syncPermissions($data['permissions'] ?? []);

        return response()->json([
            'message' => 'Role updated successfully',
            'data' => $role->load('permissions')
        ]);
    }

    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);

        if ($role->name === 'Admin') {
            return response()->json([
                'message' => 'Cannot delete Admin role'
            ], 403);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully'
        ]);
    }
}
