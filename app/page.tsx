"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus, ShoppingCart } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  image: string
  stock: number
  options?: { label: string; values: string[] }
  detailUrl?: string
}

interface CartItem {
  productId: string
  quantity: number
  selectedOption?: string
  price: number
  name: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const [showPayPay, setShowPayPay] = useState(false)

  useEffect(() => {
    const sampleProducts: Product[] = [
      {
        id: "1",
        name: "シルバーブレスレット",
        price: 3500,
        image: "/silver-bracelet.png",
        stock: 10,
        options: { label: "サイズ", values: ["16cm", "18cm"] },
        detailUrl: "https://example.com/silver-bracelet-details",
      },
      {
        id: "2",
        name: "ゴールドネックレス",
        price: 8900,
        image: "/gold-necklace.png",
        stock: 5,
        detailUrl: "https://example.com/gold-necklace-details",
      },
      {
        id: "3",
        name: "パールイヤリング",
        price: 4200,
        image: "/pearl-earrings-jewelry.jpg",
        stock: 0,
        detailUrl: "https://example.com/pearl-earrings-details",
      },
    ]

    const savedProducts = localStorage.getItem("products")
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      setProducts(sampleProducts)
      localStorage.setItem("products", JSON.stringify(sampleProducts))
    }
  }, [])

  const addToCart = (product: Product, selectedOption?: string) => {
    const cartItemId = `${product.id}-${selectedOption || "default"}`
    const existingItem = cart.find((item) => item.productId === product.id && item.selectedOption === selectedOption)

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id && item.selectedOption === selectedOption
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          quantity: 1,
          selectedOption,
          price: product.price,
          name: product.name,
        },
      ])
    }
  }

  const updateQuantity = (productId: string, selectedOption: string | undefined, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.productId === productId && item.selectedOption === selectedOption) {
            const newQuantity = item.quantity + change
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = () => {
    setShowOrderSummary(true)
  }

  const handlePayPay = () => {
    setShowPayPay(true)
  }

  const confirmPayment = () => {
    const updatedProducts = products.map((product) => {
      const cartItem = cart.find((item) => item.productId === product.id)
      if (cartItem) {
        return {
          ...product,
          stock: Math.max(0, product.stock - cartItem.quantity),
        }
      }
      return product
    })

    setProducts(updatedProducts)
    localStorage.setItem("products", JSON.stringify(updatedProducts))

    setCart([])
    setShowPayPay(false)
    setShowOrderSummary(false)

    alert("お支払いが完了しました。ありがとうございました！")
  }

  if (showPayPay) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">PayPay支払い</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <img
                  src="/paypay-payment-info.jpg"
                  alt="PayPay支払い方法"
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>お支払い手順：</strong>
                  <br />
                  1. 上記のQRコードをPayPayアプリでスキャンしてください
                  <br />
                  2. 金額を確認して支払いを完了してください
                  <br />
                  3. 支払い完了後、下の「支払い完了」ボタンを押してください
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>お支払い金額</span>
                  <span>¥{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => setShowPayPay(false)} variant="outline">
                  戻る
                </Button>
                <Button onClick={confirmPayment} className="bg-red-500 hover:bg-red-600">
                  支払い完了
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (showOrderSummary) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">ご注文内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    {item.selectedOption && <span className="text-sm text-gray-600 ml-2">({item.selectedOption})</span>}
                    <span className="text-sm text-gray-600 ml-2">× {item.quantity}個</span>
                  </div>
                  <span className="font-medium">¥{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>合計</span>
                  <span>¥{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>お支払い方法：</strong>
                  <br />
                  この画面をスクリーンショットして、下記の公式LINEアカウントに送信してください。
                  <br />
                  確認後、PayPayリンクをお送りいたします。
                </p>
              </div>

              <div className="text-center mt-6">
                <Button onClick={() => setShowOrderSummary(false)} variant="outline" className="mr-4">
                  戻る
                </Button>
                <Button onClick={handlePayPay} className="bg-red-500 hover:bg-red-600">
                  PayPayで支払う
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">ジュエリーショップ</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => (window.location.href = "/admin")}>
                管理画面
              </Button>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              cart={cart}
              onUpdateQuantity={updateQuantity}
            />
          ))}
        </div>

        {cart.length > 0 && (
          <Card className="sticky bottom-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)}点</span>
                  <span className="text-2xl font-bold ml-4">¥{getTotalPrice().toLocaleString()}</span>
                </div>
                <Button onClick={handleCheckout} size="lg">
                  注文確認へ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

function ProductCard({
  product,
  onAddToCart,
  cart,
  onUpdateQuantity,
}: {
  product: Product
  onAddToCart: (product: Product, selectedOption?: string) => void
  cart: CartItem[]
  onUpdateQuantity: (productId: string, selectedOption: string | undefined, change: number) => void
}) {
  const [selectedOption, setSelectedOption] = useState<string>("")

  const cartItem = cart.find((item) => item.productId === product.id && item.selectedOption === selectedOption)

  const isOutOfStock = product.stock === 0

  return (
    <Card className={`${isOutOfStock ? "opacity-60" : ""}`}>
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {isOutOfStock && <Badge className="absolute top-2 right-2 bg-red-500">売り切れ</Badge>}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
        <p className="text-2xl font-bold text-blue-600 mb-4">¥{product.price.toLocaleString()}</p>

        {product.detailUrl && (
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(product.detailUrl, "_blank")}
              className="w-full"
            >
              詳細を見る
            </Button>
          </div>
        )}

        {product.options && !isOutOfStock && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{product.options.label}</label>
            <Select value={selectedOption} onValueChange={setSelectedOption}>
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {product.options.values.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!isOutOfStock && (
          <div className="space-y-3">
            {cartItem ? (
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => onUpdateQuantity(product.id, selectedOption, -1)}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-medium">{cartItem.quantity}</span>
                <Button variant="outline" size="sm" onClick={() => onUpdateQuantity(product.id, selectedOption, 1)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => onAddToCart(product, selectedOption)}
                disabled={product.options && !selectedOption}
                className="w-full"
              >
                カートに追加
              </Button>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-2">在庫: {product.stock}個</p>
      </CardContent>
    </Card>
  )
}
