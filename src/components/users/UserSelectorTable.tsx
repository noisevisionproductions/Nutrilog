import React from "react";
import {User} from "../../types/user";
import LoadingSpinner from "../common/LoadingSpinner";

interface UserSelectorTableProps {
    users: User[];
    selectedUser: User | null;
    onUserSelect: (user: User | null) => void;
    loading: boolean;
}

const UserSelectorTable: React.FC<UserSelectorTableProps> = ({
                                                                 users,
                                                                 selectedUser,
                                                                 onUserSelect,
                                                                 loading
                                                             }) => {
    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wybór
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email/Nick
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
                <tr
                    key={user.id}
                    className={`hover:bg-gray-50 ${
                        selectedUser?.id === user.id ? 'bg-blue-50' : ''
                    }`}
                >
                    <td className="px-6 py-4">
                        <input
                            type="radio"
                            name="selectedUser"
                            checked={selectedUser?.id === user.id}
                            onChange={() => onUserSelect(user)}
                            className="h-4 w-4 text-blue-600"
                        />
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                            {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                            {user.nickname}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.profileCompleted
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {user.profileCompleted ? 'Kompletny' : 'Niekompletny'}
                            </span>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default UserSelectorTable;