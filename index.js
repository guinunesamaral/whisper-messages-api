import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const uri = process.env.MONGO_URI
const port = process.env.PORT || 8000

const messageSchema = new mongoose.Schema({
  chatId: Number,
  userOneId: Number,
  userTwoId: Number,
  createdAt: Date,
  updatedAt: Date,
  text: String,
  image: String,
})

// Create Message model
const Message = mongoose.model('Message', messageSchema)

// Connect to MongoDB
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  })

// Middleware for parsing JSON request bodies
app.use(express.json())

// Get all messages by chatId
app.get('/api/chats/:chatId', async (req, res) => {
  try {
    const chatId = req.params.chatId
    const messages = await Message.find({ chatId })
    res.json(messages)
  } catch (error) {
    console.error('Failed to retrieve messages:', error)
    res.status(500).send('Failed to retrieve messages')
  }
})

// Create a new message
app.post('/api/chats/messages', async (req, res) => {
  try {
    const newMessage = req.body
    newMessage.createdAt = Date.now()
    newMessage.updatedAt = newMessage.createdAt
    const message = await Message.create(newMessage)
    res.json(message)
  } catch (error) {
    console.error('Failed to create message:', error)
    res.status(500).send('Failed to create message')
  }
})

// Update a specific message by ID
app.put('/api/chats/:chatId/messages/:messageId', async (req, res) => {
  try {
    const chatId = req.params.chatId
    const messageId = req.params.id
    const updatedMessage = req.body
    updatedMessage.updatedAt = Date.now()
    delete updatedMessage.createdAt
    const message = await Message.findByOneAndUpdate({ chatId, _id: messageId }, updatedMessage, {
      new: true,
    })
    if (message) {
      res.json(message)
    } else {
      res.status(404).send('Message not found')
    }
  } catch (error) {
    console.error('Failed to update message:', error)
    res.status(500).send('Failed to update message')
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
