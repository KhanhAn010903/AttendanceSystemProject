<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function assignRoles(Request $request, User $user)
    {
        $data = $request->validate([
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', 'exists:roles,id'],
        ]);

        $roles = Role::whereIn('id', $data['roles'])
            ->pluck('name')
            ->toArray();

        $user->syncRoles($roles);

        return response()->json([
            'message' => 'Roles assigned successfully',
            'roles' => $user->getRoleNames(),
        ]);
    }
}
