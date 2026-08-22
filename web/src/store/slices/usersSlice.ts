import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import { apiClient } from '../../api/client'
import type { User, UserPayload } from '../../api/types'

interface UsersState {
  items: User[]
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
}

function extractApiErrorMessage(err: unknown): string {
  if (isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
    const data = err.response.data as Record<string, unknown>
    if (typeof data.detail === 'string') return data.detail
    const messages = Object.entries(data).flatMap(([field, value]) => {
      const text = Array.isArray(value) ? value.join(' ') : String(value)
      return field === 'non_field_errors' ? [text] : [`${field}: ${text}`]
    })
    if (messages.length) return messages.join(' ')
  }
  return 'unexpected_error'
}

export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: { status: number } }>(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<User[]>('/users/')
      return data
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue({ status: err.response.status })
      }
      throw err
    }
  },
)

export const createUser = createAsyncThunk<User, UserPayload, { rejectValue: string }>(
  'users/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<User>('/users/', payload)
      return data
    } catch (err) {
      return rejectWithValue(extractApiErrorMessage(err))
    }
  },
)

export const updateUser = createAsyncThunk<
  User,
  { id: number; payload: Partial<UserPayload> },
  { rejectValue: string }
>('users/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.patch<User>(`/users/${id}/`, payload)
    return data
  } catch (err) {
    return rejectWithValue(extractApiErrorMessage(err))
  }
})

export const deleteUser = createAsyncThunk<number, number, { rejectValue: string }>(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/users/${id}/`)
      return id
    } catch (err) {
      return rejectWithValue(extractApiErrorMessage(err))
    }
  },
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.status === 403 ? null : (action.error.message ?? 'failed_to_load_users')
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.items.findIndex((user) => user.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((user) => user.id !== action.payload)
      })
  },
})

export default usersSlice.reducer
