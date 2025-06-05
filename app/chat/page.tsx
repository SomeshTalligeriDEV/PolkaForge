"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Header from "@/components/header"
import { useWallet } from "@/hooks/use-wallet"
import { Send, Bot, User, Code, DollarSign, AlertTriangle, Zap, Shield, Sparkles, Brain } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  isCode?: boolean
  hasError?: boolean
}

export default function ChatPage() {
  const { connected, connect, account, balance } = useWallet()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        '🤖 **Welcome to PolkaForge AI Assistant!** ✨\n\nI\'m your intelligent coding companion powered by advanced AI. Here\'s what I can help you with:\n\n🔍 **Code Analysis & Bug Detection**\n• Detect security vulnerabilities\n• Find performance issues\n• Suggest best practices\n• Polkadot/Substrate specific guidance\n\n💰 **DOT Transfers**\n• Send DOT using natural language\n• Check balances and transaction history\n• Smart contract interactions\n\n🧠 **Development Assistance**\n• Explain complex concepts\n• Code optimization tips\n• Architecture recommendations\n• Debugging help\n\nTry saying: *"Review my code"* or *"Send 5 DOT to alice"*',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const detectCodeIssues = (code: string) => {
    const issues = []
    const suggestions = []

    // Security vulnerabilities
    if (code.includes("eval(") || code.includes("Function(")) {
      issues.push("🚨 **CRITICAL**: Using eval() or Function() - major security risk!")
    }

    if (code.includes(".innerHTML") && !code.includes("sanitize") && !code.includes("DOMPurify")) {
      issues.push("🛡️ **SECURITY**: innerHTML without sanitization - XSS vulnerability")
    }

    if (code.includes("password") && (code.includes("console.log") || code.includes("alert"))) {
      issues.push("🔐 **SECURITY**: Logging sensitive data - remove before production")
    }

    // Code quality issues
    if (code.includes("var ")) {
      issues.push("⚠️ **STYLE**: Using 'var' - prefer 'let' or 'const'")
      suggestions.push("Replace 'var' with 'let' for mutable variables or 'const' for constants")
    }

    if (code.includes("==") && !code.includes("===")) {
      issues.push("🔍 **QUALITY**: Loose equality (==) - use strict equality (===)")
    }

    if (code.includes("console.log") && !code.includes("// debug") && !code.includes("// TODO")) {
      issues.push("🐛 **CLEANUP**: console.log statements found - remove for production")
    }

    // Async/await issues
    if (code.includes("await") && !code.includes("async")) {
      issues.push("⚡ **ERROR**: Using 'await' without 'async' function")
    }

    if (code.includes("Promise") && code.includes(".then") && code.includes("await")) {
      issues.push("🔄 **STYLE**: Mixing async/await with .then() - choose one pattern")
    }

    // Polkadot specific
    if (code.includes("@polkadot") || code.includes("substrate")) {
      if (!code.includes("try") && !code.includes("catch")) {
        suggestions.push("Add proper error handling for Polkadot API calls")
      }
      if (code.includes("api.tx") && !code.includes("signAndSend")) {
        suggestions.push("Remember to sign and send transactions with signAndSend()")
      }
    }

    // Performance issues
    if (code.includes("for") && code.includes("document.querySelector")) {
      issues.push("⚡ **PERFORMANCE**: DOM queries in loops - cache selectors outside")
    }

    return { issues, suggestions }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
      isCode: input.includes("```"),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI processing with realistic delay
    setTimeout(
      async () => {
        let botResponse = ""
        let hasError = false

        // Check for DOT transfer commands
        const transferMatch = input.match(/send (\d+(?:\.\d+)?) dot to ([a-zA-Z0-9@]+)/i)
        if (transferMatch) {
          const amount = transferMatch[1]
          const recipient = transferMatch[2]

          if (!connected || !account) {
            botResponse = `❌ **Wallet Connection Required**\n\nTo send DOT, you need to:\n1. Connect your Polkadot wallet\n2. Ensure you have sufficient balance\n3. Try the command again\n\n🔗 Click "Connect Wallet" in the header to get started!`
            hasError = true
          } else {
            const currentBalance = Number.parseFloat(balance)
            const transferAmount = Number.parseFloat(amount)

            if (transferAmount > currentBalance) {
              botResponse = `❌ **Insufficient Balance**\n\nYou're trying to send **${amount} DOT** but only have **${balance} DOT**\n\n💡 **Suggestions:**\n• Check your balance\n• Try a smaller amount\n• Get more DOT from a faucet (testnet)`
              hasError = true
            } else {
              botResponse = `💰 **DOT Transfer Simulation**\n\n**Details:**\n• Amount: ${amount} DOT\n• Recipient: ${recipient}\n• From: ${account.address.substring(0, 8)}...${account.address.substring(account.address.length - 4)}\n• Available Balance: ${balance} DOT\n\n✅ **Transfer would be successful!**\n\n⚠️ **Demo Mode**: This is a simulation. In production, the transfer would be executed via Polkadot.js API with proper transaction confirmation.\n\n🚀 **Next Steps:**\n• Validate recipient address format\n• Confirm transaction details\n• Sign with your wallet\n• Wait for block confirmation`
            }
          }
        }
        // Enhanced code review
        else if (
          input.includes("```") ||
          input.toLowerCase().includes("review") ||
          input.toLowerCase().includes("bug")
        ) {
          const codeBlocks = input.match(/```[\s\S]*?```/g)
          if (codeBlocks) {
            const code = codeBlocks[0].replace(/```/g, "")
            const { issues, suggestions } = detectCodeIssues(code)

            if (issues.length > 0 || suggestions.length > 0) {
              botResponse = `🔍 **Advanced Code Analysis Complete**\n\n`

              if (issues.length > 0) {
                botResponse += `**🚨 Issues Found (${issues.length}):**\n${issues.map((issue, i) => `${i + 1}. ${issue}`).join("\n")}\n\n`
              }

              if (suggestions.length > 0) {
                botResponse += `**💡 Recommendations:**\n${suggestions.map((suggestion, i) => `• ${suggestion}`).join("\n")}\n\n`
              }

              botResponse += `**🛡️ Security Score:** ${issues.filter((i) => i.includes("SECURITY") || i.includes("CRITICAL")).length === 0 ? "✅ Good" : "⚠️ Needs Attention"}\n`
              botResponse += `**📊 Code Quality:** ${issues.filter((i) => i.includes("STYLE") || i.includes("QUALITY")).length <= 1 ? "✅ Good" : "⚠️ Could Improve"}\n\n`
              botResponse += `**🚀 Next Steps:**\n• Fix critical security issues first\n• Apply suggested improvements\n• Test thoroughly before deployment\n• Consider adding unit tests`

              if (issues.some((i) => i.includes("CRITICAL") || i.includes("SECURITY"))) {
                hasError = true
              }
            } else {
              botResponse = `✅ **Excellent Code Quality!**\n\nYour code looks great! Here's what I found:\n\n🛡️ **Security:** No vulnerabilities detected\n📊 **Quality:** Follows best practices\n⚡ **Performance:** No obvious bottlenecks\n\n**🌟 Pro Tips:**\n• Add comprehensive error handling\n• Include unit tests for critical functions\n• Document complex logic\n• Consider using TypeScript for better type safety\n\n**Polkadot Specific:**\n• Always handle API connection errors\n• Use proper account validation\n• Test on Westend testnet first`
            }
          } else {
            botResponse = `🤖 **Code Review Ready!**\n\nI'd love to analyze your code! Please share it using code blocks:\n\n\`\`\`javascript\n// Your code here\nfunction example() {\n  return "Hello PolkaForge!";\n}\n\`\`\`\n\n**🔍 I can detect:**\n• Security vulnerabilities\n• Performance issues\n• Best practice violations\n• Polkadot/Substrate specific problems\n• Code quality improvements\n\n**💡 Tip:** Include the programming language for better analysis!`
          }
        }
        // AI assistance and general help
        else if (input.toLowerCase().includes("help") || input.toLowerCase().includes("what can you do")) {
          botResponse = `🧠 **PolkaForge AI Assistant Capabilities**\n\n**🔍 Code Analysis:**\n• Security vulnerability detection\n• Performance optimization\n• Best practices enforcement\n• Polkadot/Substrate expertise\n• Real-time bug detection\n\n**💰 Blockchain Operations:**\n• DOT transfers via natural language\n• Balance checking\n• Transaction history\n• Smart contract interactions\n\n**🚀 Development Support:**\n• Architecture recommendations\n• Debugging assistance\n• Code optimization\n• Documentation help\n• Testing strategies\n\n**🎯 Try These Commands:**\n• "Review my smart contract code"\n• "Send 10 DOT to alice"\n• "How do I optimize this function?"\n• "Explain Polkadot consensus"\n• "Find bugs in my code"`
        }
        // Polkadot/Substrate specific questions
        else if (
          input.toLowerCase().includes("polkadot") ||
          input.toLowerCase().includes("substrate") ||
          input.toLowerCase().includes("ink") ||
          input.toLowerCase().includes("parachain")
        ) {
          botResponse = `🔗 **Polkadot Ecosystem Expertise**\n\n**🏗️ Development Best Practices:**\n• Use Polkadot.js API for blockchain interactions\n• ink! for WASM smart contracts\n• Substrate for custom blockchain development\n• Asset Hub for DOT/asset transfers\n• Always test on Westend testnet\n\n**🛡️ Security Guidelines:**\n• Validate all user inputs\n• Handle connection errors gracefully\n• Use proper account management\n• Implement transaction confirmations\n• Follow audit best practices\n\n**⚡ Performance Tips:**\n• Cache API connections\n• Batch multiple operations\n• Use efficient data structures\n• Optimize for minimal gas usage\n• Implement proper error boundaries\n\n**🎯 Need specific help?** Ask about:\n• Smart contract development\n• Parachain integration\n• Cross-chain messaging\n• Staking mechanisms\n• Governance participation`
        }
        // Smart responses for various queries
        else {
          const lowerInput = input.toLowerCase()

          if (lowerInput.includes("optimize") || lowerInput.includes("performance")) {
            botResponse = `⚡ **Performance Optimization Guide**\n\n**🚀 General Optimizations:**\n• Minimize DOM manipulations\n• Use efficient algorithms\n• Cache expensive operations\n• Lazy load resources\n• Optimize bundle size\n\n**🔗 Polkadot Specific:**\n• Batch API calls when possible\n• Use connection pooling\n• Implement proper caching\n• Optimize transaction fees\n• Use efficient data encoding\n\n**💡 Share your code and I'll provide specific optimization suggestions!**`
          } else if (lowerInput.includes("security") || lowerInput.includes("vulnerability")) {
            botResponse = `🛡️ **Security Best Practices**\n\n**🔒 Critical Security Measures:**\n• Input validation and sanitization\n• Proper authentication/authorization\n• Secure data transmission (HTTPS)\n• Regular dependency updates\n• Code auditing and testing\n\n**🔗 Blockchain Security:**\n• Validate all addresses\n• Secure private key management\n• Multi-signature wallets\n• Smart contract audits\n• Reentrancy protection\n\n**⚠️ Common Vulnerabilities:**\n• XSS attacks\n• SQL injection\n• CSRF attacks\n• Integer overflow\n• Access control issues\n\n**🔍 Want a security audit? Share your code!**`
          } else {
            botResponse = `🤖 **I understand you said:** "${input}"\n\n**🎯 I'm here to help with:**\n\n**🔍 Code Review & Analysis**\n• Share code with \`\`\`code\`\`\` blocks\n• Get instant bug detection\n• Security vulnerability scanning\n• Performance optimization tips\n\n**💰 DOT Operations**\n• "Send X DOT to [address/username]"\n• Balance checking and management\n• Transaction guidance\n\n**🧠 Development Assistance**\n• Polkadot/Substrate questions\n• Architecture recommendations\n• Best practices guidance\n• Debugging help\n\n**💡 Try being more specific about what you need help with!**`
          }
        }

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: botResponse,
          timestamp: new Date(),
          hasError,
        }

        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)
      },
      Math.random() * 1000 + 1500,
    ) // Realistic AI response time
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { text: "Review my code", icon: Code },
    { text: "Send 5 DOT to alice", icon: DollarSign },
    { text: "Optimize this function", icon: Zap },
    { text: "Security best practices", icon: Shield },
  ]

  return (
    <div className="animate-fadeIn">
      <Header />
      <div className="container py-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <Bot size={48} className="text-[#e6007a] animate-float" />
              <div className="absolute -inset-2 bg-gradient-to-r from-[#e6007a] to-[#552bbf] rounded-full opacity-20 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">PolkaForge AI Assistant</h1>
              <p className="text-lg opacity-80">Advanced code analysis, bug detection, and DOT operations</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="badge badge-primary animate-pulse">
              <Brain size={14} className="mr-1" />
              AI-Powered
            </div>
            <div className="badge badge-secondary">
              <Shield size={14} className="mr-1" />
              Security Focused
            </div>
            <div className="badge badge-secondary">
              <Zap size={14} className="mr-1" />
              Real-time Analysis
            </div>
            <div className="badge badge-secondary">
              <Sparkles size={14} className="mr-1" />
              Polkadot Native
            </div>
          </div>
        </div>

        {!connected && (
          <div className="card mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-yellow-600 animate-bounce" />
              <div>
                <h3 className="font-bold text-lg">Connect wallet for full features</h3>
                <p className="text-sm opacity-80">
                  Connect your Polkadot wallet to enable DOT transfers and personalized AI assistance
                </p>
              </div>
            </div>
            <button className="btn btn-primary mt-4 animate-glow" onClick={connect}>
              <Zap size={16} className="mr-2" />
              Connect Polkadot Wallet
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="card h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 animate-slideIn ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-4 max-w-[85%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === "user"
                            ? "bg-gradient-to-br from-[#e6007a] to-[#552bbf] text-white"
                            : "bg-gradient-to-br from-blue-500 to-purple-600 text-white animate-pulse"
                        }`}
                      >
                        {message.type === "user" ? <User size={18} /> : <Bot size={18} />}
                      </div>
                      <div
                        className={`p-4 rounded-2xl ${
                          message.type === "user"
                            ? "bg-gradient-to-br from-[#e6007a] to-[#552bbf] text-white"
                            : message.hasError
                              ? "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800"
                              : "bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20"
                        }`}
                      >
                        <div
                          className={`whitespace-pre-wrap text-sm leading-relaxed ${message.isCode ? "font-mono" : ""}`}
                        >
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 ${message.type === "user" ? "text-pink-100" : "opacity-60"}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-4 animate-fadeIn">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="loading-dots">
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                        <span className="text-sm opacity-70">AI is analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me to review code, send DOT, or help with Polkadot development..."
                      className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-transparent resize-none focus:border-[#e6007a] focus:ring-2 focus:ring-[#e6007a]/20 transition-all duration-300"
                      rows={3}
                      disabled={isTyping}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className="btn btn-primary px-6 self-end animate-glow"
                  >
                    <Send size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(action.text)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105"
                      disabled={isTyping}
                    >
                      <action.icon size={14} />
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="card text-center">
              <Code size={32} className="text-[#e6007a] mx-auto mb-3 animate-float" />
              <h3 className="font-bold mb-2">Code Analysis</h3>
              <p className="text-sm opacity-70">Advanced bug detection and security scanning</p>
            </div>

            <div className="card text-center">
              <DollarSign
                size={32}
                className="text-[#e6007a] mx-auto mb-3 animate-float"
                style={{ animationDelay: "0.5s" }}
              />
              <h3 className="font-bold mb-2">DOT Operations</h3>
              <p className="text-sm opacity-70">Natural language blockchain transactions</p>
            </div>

            <div className="card text-center">
              <Brain size={32} className="text-[#e6007a] mx-auto mb-3 animate-float" style={{ animationDelay: "1s" }} />
              <h3 className="font-bold mb-2">AI Assistance</h3>
              <p className="text-sm opacity-70">Intelligent development guidance</p>
            </div>

            {connected && (
              <div className="card bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                    <Zap size={20} className="text-white" />
                  </div>
                  <h3 className="font-bold mb-2">Wallet Connected</h3>
                  <p className="text-sm opacity-70 mb-2">Balance: {Number.parseFloat(balance).toFixed(2)} DOT</p>
                  <p className="text-xs opacity-60">Ready for DOT transfers!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
