import { useState } from 'react'
import { UploadCloud, FileSpreadsheet, CheckCircle } from 'lucide-react'

export function MatrixUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    // Mock upload logic
    setTimeout(() => {
      setUploading(false)
      setSuccess(true)
    }, 2000)
  }

  return (
    <div className="space-y-8 animate-fade-in text-white pt-4 px-4 font-sans max-w-4xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-light tracking-tight">Upload Price Matrix</h2>
        <p className="text-zinc-400 mt-2 max-w-lg">
          Upload a CSV or Excel file containing your width and height pricing matrix.
          Ensure columns map to widths (500mm to 2500mm) and rows map to heights.
        </p>
      </div>

      <div 
        className="mt-8 border-2 border-dashed border-zinc-700 hover:border-[#eab676] rounded-2xl bg-zinc-900/50 p-12 flex flex-col items-center justify-center transition-colors cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById('matrix-upload')?.click()}
      >
        <UploadCloud size={48} className="text-zinc-500 mb-4" />
        <p className="text-xl font-medium mb-1">Drang and drop a file</p>
        <p className="text-sm text-zinc-500 mb-4">or click to browse</p>
        <div className="text-xs font-mono text-zinc-600">CSV, XLSX supported</div>
        <input 
          id="matrix-upload" 
          type="file" 
          className="hidden" 
          accept=".csv, .xlsx"
          onChange={handleFileChange}
        />
      </div>

      {file && !success && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between mt-6">
          <div className="flex items-center space-x-4">
            <FileSpreadsheet className="text-[#eab676]" size={32} />
            <div>
              <p className="font-medium text-lg">{file.name}</p>
              <p className="text-sm text-zinc-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="bg-[#eab676] hover:bg-[#d9a465] text-zinc-950 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? 'Processing...' : 'Process Upload'}
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center mt-6">
          <CheckCircle className="text-green-500 mb-4" size={48} />
          <h3 className="text-xl font-medium text-green-400">Upload Successful</h3>
          <p className="text-zinc-400 mt-2 mb-4">The matrix has been linked to the corresponding setup.</p>
          <button 
            onClick={() => { setFile(null); setSuccess(false) }}
            className="text-sm text-[#eab676] hover:underline"
          >
            Upload another file
          </button>
        </div>
      )}
    </div>
  )
}
