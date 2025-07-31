"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStorages } from "../../hooks/useStorages"
import { useCategories } from "../../hooks/useCategories"
import { TableSkeleton } from "../../components/SkeletonLoader"
import SearchBar from "../../components/SearchBar"
import Modal from "../../components/Modal"
import StorageForm from "../../components/forms/StorageForm"
import { Eye } from "lucide-react"

const StoragesPage = () => {
  const navigate = useNavigate()
  const {storages,availableManagers,loading,createStorage,updateStorage,deleteStorage,toggleStorageStatus,} = useStorages()
  const { categories } = useCategories()
  const [filteredStorages, setFilteredStorages] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStorage, setEditingStorage] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredStorages([])
      return
    }

    const filtered = storages.filter(
      (storage) =>
        storage.identifier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        storage.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        storage.responsible?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredStorages(filtered)
    setCurrentPage(1) // reset page
  }

  const handleCreateStorage = () => {
    setEditingStorage(null)
    setIsModalOpen(true)
  }

  const handleEditStorage = (storage) => {
    setEditingStorage(storage)
    setIsModalOpen(true)
  }

  const handleSubmitStorage = async (storageData) => {
    let result
    if (editingStorage) {
      result = await updateStorage(editingStorage.id, storageData)
    } else {
      result = await createStorage(storageData)
    }

    if (result.success) {
      setIsModalOpen(false)
      setEditingStorage(null)
    }
  }

  const handleDeleteStorage = async (id) => {
    await deleteStorage(id)
  }

  const handleViewStorage = (storageId) => {
    navigate(`/storages/${storageId}`)
  }

  const displayStorages = filteredStorages.length > 0 ? filteredStorages : storages

  const paginatedStorages = displayStorages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(displayStorages.length / itemsPerPage)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-h1-mobile md:text-h1-desktop font-bold text-text-titleText">Gestión de Almacenes</h1>
        </div>
        <TableSkeleton rows={6} columns={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-h1-mobile md:text-h1-desktop font-bold text-text-titleText">Gestión de Almacenes</h1>
        <div className="flex justify-end items-center text-black">
          <button onClick={handleCreateStorage} className="btn-outline ml-4">
            Registrar Almacén
          </button>
        </div>
      </div>

      <div className="flex-1 justify-between items-center text-black">
        <SearchBar onSearch={handleSearch} placeholder="Escribe el nombre del almacén que deseas buscar" />
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-text-primary">#</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Categoría</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Responsable</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStorages.map((storage, index) => (
                <tr key={storage.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-text-primary font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-3 px-4 text-text">
                    {storage.category?.categoryName || "Sin categoría"}
                  </td>
                  <td className="py-3 px-4 text-text">
                    {storage.responsible
                      ? `${storage.responsible.name} ${storage.responsible.lastName}`
                      : "Sin asignar"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        storage.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {storage.status ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleViewStorage(storage.id)} className="btn-primary text-sm px-3 py-1">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEditStorage(storage)}className="btn-outline text-sm px-3 py-1">
                        Editar
                      </button>
                      <button onClick={() => handleDeleteStorage(storage.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors">
                        Eliminar
                      </button>
                      <button
                        onClick={() => toggleStorageStatus(storage.id)}
                        className={`text-white px-3 py-1 rounded-lg text-sm transition-colors ${
                          storage.status
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {storage.status ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {displayStorages.length === 0 && (
            <div className="text-center py-8 text-text">No se encontraron almacenes</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1px-3 py-1 bg-primary"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? "bg-primary text-white" : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-primary"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStorage ? "Editar Almacén" : "Crear Almacén"}
      >
        <StorageForm
          storage={editingStorage}
          onSubmit={handleSubmitStorage}
          onCancel={() => setIsModalOpen(false)}
          categories={categories}
          availableManagers={availableManagers}
        />
      </Modal>
    </div>
  )
}

export default StoragesPage
