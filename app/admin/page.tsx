"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Edit, Trash2, Lock, ChevronUp, ChevronDown } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  image: string
  stock: number
  options?: { label: string; values: string[] }
  detailUrl?: string
  order?: number // Added order field for sorting
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const [products, setProducts] = useState<Product[]>([])
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const authStatus = sessionStorage.getItem("adminAuth")
    if (authStatus === "authenticated") {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      const savedProducts = localStorage.getItem("products")
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts))
      }
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple password check - you can change this password
    const adminPassword = "admin123"

    if (password === adminPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem("adminAuth", "authenticated")
      setError("")
    } else {
      setError("パスワードが間違っています")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("adminAuth")
    setPassword("")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <CardTitle className="text-2xl">管理画面ログイン</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="管理者パスワードを入力"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                ログイン
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const saveProducts = (newProducts: Product[]) => {
    const sortedProducts = newProducts
      .map((product, index) => ({
        ...product,
        order: product.order ?? index,
      }))
      .sort((a, b) => a.order - b.order)

    setProducts(sortedProducts)
    localStorage.setItem("products", JSON.stringify(sortedProducts))
  }

  const addProduct = (productData: Omit<Product, "id">) => {
    const newProduct = {
      ...productData,
      id: Date.now().toString(),
      order: products.length, // Set order to end of list
    }
    saveProducts([...products, newProduct])
    setShowAddForm(false)
  }

  const updateProduct = (id: string, productData: Partial<Product>) => {
    const updatedProducts = products.map((p) => (p.id === id ? { ...p, ...productData } : p))
    saveProducts(updatedProducts)
    setIsEditing(null)
  }

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter((p) => p.id !== id)
    saveProducts(updatedProducts)
  }

  const moveProductUp = (id: string) => {
    const currentIndex = products.findIndex((p) => p.id === id)
    if (currentIndex > 0) {
      const newProducts = [...products]
      const temp = newProducts[currentIndex].order
      newProducts[currentIndex].order = newProducts[currentIndex - 1].order
      newProducts[currentIndex - 1].order = temp
      saveProducts(newProducts)
    }
  }

  const moveProductDown = (id: string) => {
    const currentIndex = products.findIndex((p) => p.id === id)
    if (currentIndex < products.length - 1) {
      const newProducts = [...products]
      const temp = newProducts[currentIndex].order
      newProducts[currentIndex].order = newProducts[currentIndex + 1].order
      newProducts[currentIndex + 1].order = temp
      saveProducts(newProducts)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => (window.location.href = "/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                ショップに戻る
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">管理画面</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">商品管理</h2>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            商品を追加
          </Button>
        </div>

        {showAddForm && <ProductForm onSubmit={addProduct} onCancel={() => setShowAddForm(false)} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card key={product.id}>
              <CardHeader className="p-0">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-4">
                {isEditing === product.id ? (
                  <ProductEditForm
                    product={product}
                    onSave={(data) => updateProduct(product.id, data)}
                    onCancel={() => setIsEditing(null)}
                  />
                ) : (
                  <>
                    <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                    <p className="text-xl font-bold text-blue-600 mb-2">¥{product.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mb-4">在庫: {product.stock}個</p>
                    {product.detailUrl && (
                      <p className="text-sm text-gray-600 mb-4">
                        詳細ページ:{" "}
                        <a href={product.detailUrl} target="_blank" rel="noopener noreferrer">
                          {product.detailUrl}
                        </a>
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveProductUp(product.id)}
                          disabled={index === 0}
                          title="上に移動"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveProductDown(product.id)}
                          disabled={index === products.length - 1}
                          title="下に移動"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(product.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

function ProductForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Omit<Product, "id">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
    detailUrl: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let imageUrl = formData.image || "/diverse-products-still-life.png"
    if (imageFile) {
      imageUrl = URL.createObjectURL(imageFile)
    }

    onSubmit({
      name: formData.name,
      price: Number.parseInt(formData.price),
      stock: Number.parseInt(formData.stock),
      image: imageUrl,
      detailUrl: formData.detailUrl,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>新商品追加</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">商品名</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">価格</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="stock">在庫数</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="image">商品画像</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
            <p className="text-sm text-gray-500 mt-1">画像ファイルを選択してください</p>
          </div>
          <div>
            <Label htmlFor="detailUrl">詳細ページURL</Label>
            <Input
              id="detailUrl"
              value={formData.detailUrl}
              onChange={(e) => setFormData({ ...formData, detailUrl: e.target.value })}
              placeholder="商品詳細ページのURLを入力（任意）"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">追加</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function ProductEditForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product
  onSave: (data: Partial<Product>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price.toString(),
    stock: product.stock.toString(),
    detailUrl: product.detailUrl || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      price: Number.parseInt(formData.price),
      stock: Number.parseInt(formData.stock),
      detailUrl: formData.detailUrl,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="商品名"
      />
      <Input
        type="number"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        placeholder="価格"
      />
      <Input
        type="number"
        value={formData.stock}
        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
        placeholder="在庫数"
      />
      <Input
        value={formData.detailUrl}
        onChange={(e) => setFormData({ ...formData, detailUrl: e.target.value })}
        placeholder="詳細ページURL"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          保存
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}
