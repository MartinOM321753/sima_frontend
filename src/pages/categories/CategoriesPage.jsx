"use client"

import { useState } from "react"
import { useCategories } from "../../hooks/useCategories"
import { TableSkeleton } from "../../components/SkeletonLoader"
import SearchBar from "../../components/SearchBar"
import Modal from "../../components/Modal"
import CategoryForm from "../../components/forms/CategoryForm"

const CategoriesPage = () => {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories()
  const [filteredCategories, setFilteredCategories] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredCategories([])
      return
    }

    const filtered = categories.filter((category) => category.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredCategories(filtered)
  }

  const handleCreateCategory = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleSubmitCategory = async (values) => {
    let result
    if (editingCategory) {
      result = await updateCategory(editingCategory.id, values.name)
    } else {
      result = await createCategory(values.name)
    }

    if (result.success) {
      setIsModalOpen(false)
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = async (id) => {
    await deleteCategory(id)
  }

  const displayCategories = filteredCategories.length > 0 ? filteredCategories : categories

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-h1-mobile md:text-h1-desktop font-bold text-text-titleText">Gestión de Categorías</h1>
        </div>
        <TableSkeleton rows={6} columns={3} />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-h1-mobile md:text-h1-desktop font-bold text-text-titleText">Gestión de Categorías</h1>

        <div className="flex justify-end items-center text-black">
          <button onClick={handleCreateCategory} className="btn-outline ml-4">
          Registrar categoría
          </button>
        </div>
      </div>


      <div className="flex-1 justify-between items-center text-black">
        <SearchBar onSearch={handleSearch} placeholder="Escribe el nombre de la categoría que deseas buscar" />
      </div>



      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-text-primary">#</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayCategories.map((category, indx) => (
                <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-text">{indx + 1}</td>
                  <td className="py-3 px-4 text-text-primary font-medium">{category.categoryName}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditCategory(category)} className="btn-outline text-sm px-3 py-1">
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
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

          {displayCategories.length === 0 && (
            <div className="text-center py-8 text-text">No se encontraron categorías</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Editar Categoría" : "Crear Categoría"}
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSubmitCategory}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default CategoriesPage
