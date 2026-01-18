export async function uploadFileClient(noteId: number, file: File, filename: string) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("filename", filename)
  let res: Response
  try {
    res = await fetch(`/api/notes/${noteId}/files`, {
      method: "POST",
      body: formData
    })
  } catch (err) {
    throw new Error(`Network error: ${err instanceof Error ? err.message : "Failed to connect"}`)
  }
  if (!res.ok) {
    let message = "Upload failed"
    try {
      const error = await res.json()
      message = error.message || message
    } catch {
      message = `Upload failed: ${res.status} ${res.statusText}`
    }
    throw new Error(message)
  }
  return (await res.json()) as { filename: string }
}

export async function getNoteFilesClient(noteId: number) {
  const res = await fetch(`/api/notes/${noteId}/files`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return (await res.json()) as { files: string[] }
}

export async function getFileUrlClient(noteId: number, filename: string) {
  const params = new URLSearchParams({ filename })
  const res = await fetch(`/api/notes/${noteId}/files?${params.toString()}`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
  return (await res.json()) as { url: string }
}

export async function deleteFileClient(noteId: number, filename: string) {
  const params = new URLSearchParams({ filename })
  const res = await fetch(`/api/notes/${noteId}/files?${params.toString()}`, {
    method: "DELETE"
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }
}
