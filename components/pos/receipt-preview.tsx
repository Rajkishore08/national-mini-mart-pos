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
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return (
        date.toLocaleDateString("en-IN") +
        " " +
        date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${transaction.invoice_number}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.3;
            max-width: 80mm;
            margin: 0 auto;
            padding: 5mm;
            color: #000;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 3px 0; }
          .double-line { border-top: 2px solid #000; margin: 3px 0; }
          .row { display: flex; justify-content: space-between; margin: 1px 0; }
          .item-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 1px 0;
            font-size: 10px;
          }
          .item-name { 
            flex: 1; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            white-space: nowrap;
            margin-right: 5px;
          }
          .loyalty-box {
            border: 1px solid #000;
            padding: 3px;
            margin: 3px 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="center bold">
          ${storeSettings.store_name || "NATIONAL MINI MART"}<br>
          ${storeSettings.store_address || ""}<br>
          ${storeSettings.store_phone || ""}<br>
          GST: ${storeSettings.gst_number || ""}<br>
        </div>
        
        <div class="double-line"></div>
        
        <div>
          Date: ${formatDate(transaction.created_at)}<br>
          Bill No: ${transaction.invoice_number}<br>
          Cashier: ${transaction.cashier?.full_name || "Staff"}<br>
          ${transaction.customer ? `Customer: ${transaction.customer.name}<br>` : ""}
          ${transaction.customer ? `Phone: ${transaction.customer.phone}<br>` : ""}
        </div>
        
        <div class="line"></div>
        
        <div class="row bold">
          <span>Item</span>
          <span>Qty</span>
          <span>Rate</span>
          <span>Amount</span>
        </div>
        
        <div class="line"></div>
        
        ${transaction.items
          .map(
            (item: any) => `
          <div class="item-row">
            <div class="item-name">${item.product.name}</div>
            <div style="width: 25px; text-align: center;">${item.quantity}</div>
            <div style="width: 45px; text-align: right;">₹${item.product.price.toFixed(2)}</div>
            <div style="width: 50px; text-align: right;">₹${item.total.toFixed(2)}</div>
          </div>
        `,
          )
          .join("")}
        
        <div class="line"></div>
        
        <div class="row">
          <span>Subtotal:</span>
          <span>₹${transaction.subtotal.toFixed(2)}</span>
        </div>
        <div class="row">
          <span>CGST (${((transaction.gst_amount / transaction.subtotal) * 50).toFixed(1)}%):</span>
          <span>₹${(transaction.gst_amount / 2).toFixed(2)}</span>
        </div>
        <div class="row">
          <span>SGST (${((transaction.gst_amount / transaction.subtotal) * 50).toFixed(1)}%):</span>
          <span>₹${(transaction.gst_amount / 2).toFixed(2)}</span>
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
        <div class="double-line"></div>
        <div class="row bold">
          <span>TOTAL:</span>
          <span>₹${transaction.total_amount.toFixed(2)}</span>
        </div>
        
        ${
          transaction.payment_method === "cash"
            ? `
          <div class="line"></div>
          <div class="row">
            <span>Cash:</span>
            <span>₹${transaction.cash_received.toFixed(2)}</span>
          </div>
          <div class="row">
            <span>Change:</span>
            <span>₹${transaction.change_amount.toFixed(2)}</span>
          </div>
        `
            : `
          <div class="line"></div>
          <div class="row">
            <span>Payment:</span>
            <span>${transaction.payment_method.toUpperCase()}</span>
          </div>
        `
        }
        
        ${
          transaction.customer && (transaction.loyalty_points_earned > 0 || transaction.loyalty_points_redeemed > 0)
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
        
        <div class="center">
          ${storeSettings.receipt_footer || "Thank You! Visit Again!"}<br>
          <div style="margin-top: 5px; font-size: 9px;">
            Powered by National Mini Mart POS
          </div>
        </div>
        
        <div style="height: 20px;"></div>
      </body>
      </html>
    `
  }

  const generatePDFReceiptHTML = () => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return (
        date.toLocaleDateString("en-IN") +
        " " +
        date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${transaction.invoice_number}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            color: #000;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .customer-details {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .totals {
            margin-left: auto;
            width: 300px;
          }
          .total-row {
            font-weight: bold;
            background-color: #f0f0f0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #000;
          }
          .loyalty-section {
            background-color: #f9f9f9;
            border: 2px solid #6366f1;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${storeSettings.store_name || "NATIONAL MINI MART"}</div>
          <div>${storeSettings.store_address || ""}</div>
          <div>Phone: ${storeSettings.store_phone || ""} | GST: ${storeSettings.gst_number || ""}</div>
        </div>
        
        <div class="invoice-details">
          <div>
            <strong>Invoice No:</strong> ${transaction.invoice_number}<br>
            <strong>Date:</strong> ${formatDate(transaction.created_at)}<br>
            <strong>Cashier:</strong> ${transaction.cashier?.full_name || "Staff"}
          </div>
          <div>
            <strong>Payment Method:</strong> ${transaction.payment_method.toUpperCase()}<br>
            ${transaction.payment_method === "cash" ? `<strong>Cash Received:</strong> ₹${transaction.cash_received.toFixed(2)}<br>` : ""}
            ${transaction.payment_method === "cash" ? `<strong>Change:</strong> ₹${transaction.change_amount.toFixed(2)}` : ""}
          </div>
        </div>
        
        ${
          transaction.customer
            ? `
        <div class="customer-details">
          <strong>Customer Details:</strong><br>
          Name: ${transaction.customer.name}<br>
          Phone: ${transaction.customer.phone}<br>
          ${transaction.customer.email ? `Email: ${transaction.customer.email}<br>` : ""}
        </div>
        `
            : ""
        }
        
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Item Description</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Rate</th>
              <th class="text-right">GST%</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transaction.items
              .map(
                (item: any, index: number) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.product.name}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">₹${item.product.price.toFixed(2)}</td>
                <td class="text-right">${item.product.gst_rate}%</td>
                <td class="text-right">₹${item.total.toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <table class="totals">
          <tr>
            <td><strong>Subtotal:</strong></td>
            <td class="text-right">₹${transaction.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>CGST:</td>
            <td class="text-right">₹${(transaction.gst_amount / 2).toFixed(2)}</td>
          </tr>
          <tr>
            <td>SGST:</td>
            <td class="text-right">₹${(transaction.gst_amount / 2).toFixed(2)}</td>
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
            <td><strong>TOTAL:</strong></td>
            <td class="text-right"><strong>₹${transaction.total_amount.toFixed(2)}</strong></td>
          </tr>
        </table>
        
        ${
          transaction.customer && (transaction.loyalty_points_earned > 0 || transaction.loyalty_points_redeemed > 0)
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
          <p><strong>${storeSettings.receipt_footer || "Thank You! Visit Again!"}</strong></p>
          <p style="font-size: 10px; margin-top: 10px;">
            This is a computer generated invoice and does not require signature.
          </p>
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
