"use client";

import { useEffect, useState } from 'react';
import useFetchUsers from '@/app/hooks/useFetchUsers/route';
import { nunito } from "@/app/ui/fonts";

import { useSession } from "next-auth/react";
import UserImage from "@/app/components/userimage";
import { useRouter } from 'next/navigation'

export default function AdminComponent() {
  const { data: users, loading, error, refetch } = useFetchUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [editableUser, setEditableUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isFaculty, setIsFaculty] = useState<boolean>(false);

  const { data: session, status } = useSession();
  const router = useRouter()

  useEffect(() => {
    // Redirect if user is not logged in
    if (!session) {
      router.push('/');
      return;
    }

    // Fetch user details and check admin status
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${session?.user?.email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        if (!data.is_Admin) {
          router.push('/')
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/');
      }
    };

    fetchUser();

  }, [session]);

  if (status === 'loading') {
    return <div className="pl-[10em] pt-[3em]"><h1 className="text-2xl font-bold">Loading...</h1></div>;
  }

  if (error) return <div className="pl-[10em] pt-[3em]"><h1 className='text-red-500 text-2xl font-bold'></h1>Error loading users</div>;

  const handleEdit = (user: any) => {
    setEditableUser(user);
    setIsAdmin(user.is_Admin);
    setIsFaculty(user.is_Faculty);
  };

  const handleSave = async () => {
    if (editableUser) {
      try {
        const response = await fetch(`/api/users/${editableUser.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          next: {
            tags: ['questions']
          },
          cache: 'no-store',
          body: JSON.stringify({
            isAdmin,
            isFaculty,
          }),
        });

        if (response.ok) {
          refetch(); // Refetch the users list after successful update
          setEditableUser(null); // Clear editableUser state after saving
        } else {
          console.error('Failed to update user');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };


  const handleCancel = () => {
    setEditableUser(null); // Clear editableUser state without saving
  };

  const filteredUsers = users
    .filter((user: any) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => {
      // Convert createdAt strings to Date objects for comparison
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // Sort in descending order
    });

  return (
    <div className={`${nunito.className} antialiased flex flex-col`}>

      <UserImage />

      <div className="w-full p-4">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        <input
          type="text"
          placeholder="Search by name or email"
          className="border border-gray-300 rounded-md px-3 py-2 mb-4 form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading && <p>Loading...</p>}
        {error && <p>Error fetching users</p>}
        {!loading && !error && (
          <table className="table shadow-inset rounded table-responsive-sm table-striped">
            <thead>
              <tr>
                <th className="border-0">ID</th>
                <th className="border-0">Email</th>
                <th className="border-0">Name</th>
                <th className="border-0">Admin</th>
                <th className="border-0">Faculty</th>
                <th className="border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: any) => (
                <tr key={user.id}>
                  <td className="w-25">{user.id}</td>
                  <td className="">{user.email}</td>
                  <td className="">{user.name}</td>
                  <td className="">
                    {editableUser === user ? (
                      <select
                        value={isAdmin.toString()}
                        onChange={(e) => setIsAdmin(e.target.value === 'true')}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      user.is_Admin ? 'Yes' : 'No'
                    )}
                  </td>
                  <td className="">
                    {editableUser === user ? (
                      <select
                        value={isFaculty.toString()}
                        onChange={(e) => setIsFaculty(e.target.value === 'true')}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      user.is_Faculty ? 'Yes' : 'No'
                    )}
                  </td>
                  <td className="">
                    {editableUser === user ? (
                      <>
                        <button className="mr-2 bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
                          onClick={handleSave}
                        >
                          Save
                        </button>
                        <button className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}