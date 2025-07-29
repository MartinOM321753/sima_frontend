"use client"

import { useState } from "react"
import { useUsers } from "../../hooks/useUsers"
import { useStorages } from "../../hooks/useStorages"
import { TableSkeleton } from "../../components/SkeletonLoader"
import SearchBar from "../../components/SearchBar"
import Modal from "../../components/Modal"
import UserForm from "../../components/forms/UserForm"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const UsersPage = () => {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers()
  const { storages, fetchStoragesByResponsible } = useStorages()
  const [userStorage, setUserStorage] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredUsers([])
      return
    }

    const filtered = users
      .filter((user) => user.rol?.name !== "ADMIN") // <-- excluye admin
      .filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )

    setFilteredUsers(filtered)
  }


  const handleCreateUser = () => {
    setEditingUser(null)
    setUserStorage(null); // Limpia el almacén
    setIsModalOpen(true)
  }

  const handleEditUser = async (user) => {
    setEditingUser(user);
    if (user?.id) {
      const storage = await handleGetStorageByResponsable(user.id);
      setUserStorage(storage);
    } else {
      setUserStorage(null);
    }
    setIsModalOpen(true);
  };


  const handleSubmitUser = async (userData) => {
    let result
    if (editingUser) {
      result = await updateUser(editingUser.id, userData)
    } else {
      result = await createUser(userData)
    }

    if (result.success) {
      setIsModalOpen(false)
      setEditingUser(null)
    }
  }
  const handleGetStorageByResponsable = async (id) => {
    try {
      const result = await fetchStoragesByResponsible(id);
      return result.data; // puede ser null y está bien
    } catch (error) {
      console.warn("No se encontró almacén para este responsable. Esto es esperado en algunos casos.");
      return null;
    }
  };

  const handleDeleteUser = async (id) => {
    await deleteUser(id)
  }

  const displayUsers = (filteredUsers.length > 0 ? filteredUsers : users).filter(
    (user) => user.rol?.name !== "ADMIN"
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-h1-mobile md:text-h1-desktop font-bold text-text-titleText">Gestión de Usuarios</h1>
        </div>
        <TableSkeleton rows={6} columns={4} />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center p-1">
        <h1 className="text-h1-mobile md:text-h1-desktop font-bold text-text-titleText">Gestión de Usuarios</h1>

        <div className="flex justify-end items-center  text-black mx-2">
          <button onClick={handleCreateUser} className="btn-outline ml-4 ">
            Registar Usuario</button>
        </div>
      </div>

      <div className="flex-1 justify-between items-center text-black">
        <SearchBar onSearch={handleSearch} placeholder="Escribe el nombre del usuario que deseas buscar" />
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Estatus</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Registro</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Acciones</th>
              </tr>
            </thead>
            <tbody>
            {displayUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-text-primary font-medium">
                    {user.name} {user.lastName}
                  </td>
                  <td className="py-3 px-4 text-text">{user.email}</td>
                  <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{user.active ? "Activo" : "Inactivo"}</span>
                  </td>
                  <td className="py-3 px-4 text-text">
                    {format(new Date(user.createdAt), "dd 'de' MMMM yyyy", { locale: es })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditUser(user)} className="btn-outline text-sm px-3 py-1">
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {displayUsers.length === 0 && <div className="text-center py-8 text-text">No se encontraron usuarios</div>}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Editar Usuario" : "Crear Usuario"}
      >
        <UserForm
          user={editingUser}
          onSubmit={handleSubmitUser}
          onCancel={() => setIsModalOpen(false)}
          availableStorages={userStorage}
        />
      </Modal>
    </div>
  )
}

export default UsersPage
