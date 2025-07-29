"use client"

import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

const CategorySchema = Yup.object().shape({
  name: Yup.string().required("El nombre de la categoría es requerido"),
})

const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const isEditing = !!category

  const initialValues = {
    name: category?.categoryName || "",
  }

  return (
    <Formik initialValues={initialValues} validationSchema={CategorySchema} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-4 text-black" >
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Nombre de la categoría:</label>
            <Field type="text" name="name" placeholder="Escribe el nombre de la categoría" className="input-field" />
            <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 btn-outline">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary disabled:opacity-50">
              {isEditing ? "Guardar" : "Crear Categoría"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default CategoryForm
