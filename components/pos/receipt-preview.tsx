"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase-client"
import { Printer, Gift, FileText } from "lucide-react"
import { motion } from "framer-motion"

type ReceiptProps = {
  transaction: any
  onClose: () => void
}

export function ReceiptPreview({ transaction, onClose }: ReceiptProps) {
  const [storeSettings, setStoreSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchStoreSettings()
  }, [])

  const fetchStoreSettings = async () => {
    const { data } = await supabase.from("settings").select("key, value")

    if (data) {
      const settings = data.reduce(
        (acc, setting) => {
          acc[setting.key] = setting.value
          return acc
        },
        {} as Record<string, string>,
      )
      setStoreSettings(settings)
    }
  }

  const printThermalReceipt = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const receiptHtml = generateThermalReceiptHTML()
    printWindow.document.write(receiptHtml)
    printWindow.document.close()
    printWindow.print()
  }

  const generatePDFReceipt = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const pdfHtml = generatePDFReceiptHTML()
    printWindow.document.write(pdfHtml)
    printWindow.document.close()
    printWindow.print()
  }

  const generateThermalReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt</title>
        <style>
          body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
          .header { text-align: center; margin-bottom: 10px; }
          .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
          .subtitle { font-size: 12px; color: #666; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .item { margin: 5px 0; }
          .item-name { font-weight: bold; }
          .item-details { font-size: 10px; color: #666; }
          .line { border-top: 1px dashed #ccc; margin: 5px 0; }
          .total { font-weight: bold; font-size: 14px; }
          .loyalty-box { border: 1px solid #000; padding: 5px; margin: 10px 0; text-align: center; }
          .bold { font-weight: bold; }
          .footer { text-align: center; margin-top: 10px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">NATIONAL MINI MART</div>
          <div class="subtitle">Your Trusted Store</div>
          <div class="subtitle">Bill No: ${transaction.invoice_number}</div>
          <div class="subtitle">Date: ${new Date(transaction.created_at).toLocaleDateString()}</div>
          <div class="subtitle">Time: ${new Date(transaction.created_at).toLocaleTimeString()}</div>
          ${transaction.customer ? `<div class="subtitle">Customer: ${transaction.customer.name}</div>` : ''}
        </div>
        
        <div class="line"></div>
        
        ${transaction.items.map((item: any) => `
          <div class="item">
            <div class="row">
              <span class="item-name">${item.product.name}</span>
              <span>${item.quantity} × ₹${item.product.price}</span>
            </div>
            <div class="item-details">
              ${item.product.brand} • HSN: ${item.product.hsn_code} • ${item.product.gst_rate}% GST
            </div>
            <div class="row">
              <span>Subtotal:</span>
              <span>₹${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        `).join('')}
        
        <div class="line"></div>
        
        <div class="row">
          <span>Subtotal:</span>
          <span>₹${transaction.subtotal.toFixed(2)}</span>
        </div>
        <div class="row">
          <span>GST Amount:</span>
          <span>₹${transaction.gst_amount.toFixed(2)}</span>
        </div>
        ${transaction.loyalty_discount_amount > 0 ? `
        <div class="row">
          <span>Loyalty Discount:</span>
          <span>-₹${transaction.loyalty_discount_amount.toFixed(2)}</span>
        </div>
        ` : ''}
        ${transaction.rounding_adjustment !== 0 ? `
        <div class="row">
          <span>Rounding:</span>
          <span>₹${transaction.rounding_adjustment.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="row total">
          <span>TOTAL:</span>
          <span>₹${transaction.total_amount.toFixed(2)}</span>
        </div>
        
        <div class="row">
          <span>Payment Method:</span>
          <span>${transaction.payment_method.toUpperCase()}</span>
        </div>
        ${transaction.cash_received ? `
        <div class="row">
          <span>Cash Received:</span>
          <span>₹${transaction.cash_received.toFixed(2)}</span>
        </div>
        <div class="row">
          <span>Change:</span>
          <span>₹${transaction.change_amount?.toFixed(2) || '0.00'}</span>
        </div>
        ` : ''}
        
        ${transaction.customer && (transaction.loyalty_points_earned > 0 || transaction.loyalty_points_redeemed > 0)
          ? `
        <div class="line"></div>
        <div class="loyalty-box">
          <div class="bold">LOYALTY POINTS</div>
          ${transaction.loyalty_points_earned > 0 ? `<div>Points Earned: +${transaction.loyalty_points_earned}</div>` : ''}
          ${transaction.loyalty_points_redeemed > 0 ? `<div>Points Redeemed: -${transaction.loyalty_points_redeemed}</div>` : ''}
          <div>Thank you for your loyalty!</div>
        </div>
        `
          : ""
        }
        
        <div class="line"></div>
        
        <div class="footer">
          <div>Thank you for shopping with us!</div>
          <div>Visit again</div>
        </div>
      </body>
      </html>
    `
  }

  const generatePDFReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; max-width: 400px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #333; }
          .subtitle { font-size: 14px; color: #666; margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .item-details { font-size: 12px; color: #666; margin-top: 2px; }
          .total-row { font-weight: bold; font-size: 16px; background-color: #f8f9fa; }
          .loyalty-section { background-color: #f0f8ff; padding: 10px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">NATIONAL MINI MART</div>
          <div class="subtitle">Your Trusted Store</div>
          <div class="subtitle">Bill No: ${transaction.invoice_number}</div>
          <div class="subtitle">Date: ${new Date(transaction.created_at).toLocaleDateString()}</div>
          <div class="subtitle">Time: ${new Date(transaction.created_at).toLocaleTimeString()}</div>
          ${transaction.customer ? `<div class="subtitle">Customer: ${transaction.customer.name}</div>` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${transaction.items.map((item: any) => `
              <tr>
                <td>
                  <div>${item.product.name}</div>
                  <div class="item-details">${item.product.brand} • HSN: ${item.product.hsn_code}</div>
                </td>
                <td>${item.quantity}</td>
                <td>₹${item.product.price}</td>
                <td class="text-right">₹${(item.product.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <table>
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">₹${transaction.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>GST Amount:</td>
            <td class="text-right">₹${transaction.gst_amount.toFixed(2)}</td>
          </tr>
          ${transaction.loyalty_discount_amount > 0 ? `
          <tr>
            <td>Loyalty Discount:</td>
            <td class="text-right">-₹${transaction.loyalty_discount_amount.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${transaction.rounding_adjustment !== 0 ? `
          <tr>
            <td>Rounding:</td>
            <td class="text-right">₹${transaction.rounding_adjustment.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td>TOTAL:</td>
            <td class="text-right">₹${transaction.total_amount.toFixed(2)}</td>
          </tr>
        </table>
        
        <div style="margin: 15px 0;">
          <strong>Payment Method:</strong> ${transaction.payment_method.toUpperCase()}
          ${transaction.cash_received ? `
          <br><strong>Cash Received:</strong> ₹${transaction.cash_received.toFixed(2)}
          <br><strong>Change:</strong> ₹${transaction.change_amount?.toFixed(2) || '0.00'}
          ` : ''}
        </div>
        
        ${transaction.customer && (transaction.loyalty_points_earned > 0 || transaction.loyalty_points_redeemed > 0)
          ? `
        <div class="loyalty-section">
          <h3 style="margin: 0 0 10px 0; color: #6366f1;">🎁 LOYALTY REWARDS</h3>
          ${transaction.loyalty_points_earned > 0 ? `<p style="margin: 5px 0; font-size: 16px;"><strong>Points Earned: +${transaction.loyalty_points_earned}</strong></p>` : ''}
          ${transaction.loyalty_points_redeemed > 0 ? `<p style="margin: 5px 0; font-size: 16px;"><strong>Points Redeemed: -${transaction.loyalty_points_redeemed}</strong></p>` : ''}
          <p style="margin: 5px 0;">Thank you for being a valued customer!</p>
        </div>
        `
          : ""
        }
        
        <div class="footer">
          <div style="font-size: 16px; margin-bottom: 5px;">Thank you for shopping with us!</div>
          <div>Visit again</div>
        </div>
      </body>
      </html>
    `
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
          <DialogDescription>
            Preview and print transaction receipt
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white text-black p-4 font-mono text-xs border rounded max-h-96 overflow-y-auto"
        >
          <div className="text-center font-bold mb-2">
            ================================
            <br />
            {storeSettings.store_name || "NATIONAL MINI MART"}
            <br />
            {storeSettings.store_address}
            <br />
            {storeSettings.store_phone}
            <br />
            GST: {storeSettings.gst_number}
            <br />
            ================================
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          <div className="mb-2">
            Date: {new Date(transaction.created_at).toLocaleDateString("en-IN")}{" "}
            {new Date(transaction.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            <br />
            Bill No: {transaction.invoice_number}
            <br />
            Cashier: {transaction.cashier?.full_name || "Staff"}
            <br />
            {transaction.customer && `Customer: ${transaction.customer.name}`}
            <br />
            {transaction.customer && `Phone: ${transaction.customer.phone}`}
            <br />
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          <div className="flex justify-between font-bold mb-1">
            <span>Item</span>
            <span>Qty</span>
            <span>Amount</span>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {transaction.items.map((item: any, index: number) => (
            <div key={index} className="flex justify-between mb-1">
              <span className="flex-1 truncate pr-2">{item.product.name}</span>
              <span className="w-8 text-center">{item.quantity}</span>
              <span className="w-16 text-right">₹{item.total.toFixed(2)}</span>
            </div>
          ))}

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{transaction.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (9%):</span>
              <span>₹{(transaction.gst_amount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (9%):</span>
              <span>₹{(transaction.gst_amount / 2).toFixed(2)}</span>
            </div>
            {transaction.loyalty_discount_amount > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Loyalty Discount:</span>
                <span>-₹{transaction.loyalty_discount_amount.toFixed(2)}</span>
              </div>
            )}
            {transaction.rounding_adjustment !== 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Rounding:</span>
                <span>₹{transaction.rounding_adjustment.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>₹{transaction.total_amount.toFixed(2)}</span>
            </div>

            {transaction.payment_method === "cash" && (
              <>
                <div className="flex justify-between">
                  <span>Cash:</span>
                  <span>₹{transaction.cash_received.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>₹{transaction.change_amount.toFixed(2)}</span>
                </div>
              </>
            )}

            {transaction.payment_method !== "cash" && (
              <div className="flex justify-between">
                <span>Payment:</span>
                <span>{transaction.payment_method.toUpperCase()}</span>
              </div>
            )}
          </div>

          {transaction.customer && (transaction.loyalty_points_earned > 0 || transaction.loyalty_points_redeemed > 0) && (
            <>
              <div className="border-t border-dashed border-gray-400 my-2"></div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center bg-purple-50 p-2 rounded"
              >
                <div className="flex items-center justify-center mb-1">
                  <Gift className="h-4 w-4 mr-1 text-purple-600" />
                  <span className="font-bold text-purple-800">LOYALTY POINTS</span>
                </div>
                <div className="text-purple-700">
                  Points Earned:{" "}
                  <Badge className="bg-purple-600 text-white">+{transaction.loyalty_points_earned}</Badge>
                </div>
                <div className="text-xs text-purple-600 mt-1">Thank you for your loyalty!</div>
              </motion.div>
            </>
          )}

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          <div className="text-center">
            {storeSettings.receipt_footer || "Thank You! Visit Again!"}
            <br />
            ================================
          </div>
        </motion.div>

        <div className="flex gap-2 mt-4">
          <Button onClick={printThermalReceipt} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
            <Printer className="h-4 w-4 mr-2" />
            Print 3" Thermal
          </Button>
          <Button onClick={generatePDFReceipt} variant="outline" className="flex-1 bg-transparent">
            <FileText className="h-4 w-4 mr-2" />
            PDF Invoice
          </Button>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full mt-2 bg-transparent">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}
