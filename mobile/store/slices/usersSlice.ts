import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { usersApi } from '../../services/saudiApi';
import { getErrorMessage } from '../../utils/apiHelpers';
import { User, UserPayload } from '../../types/api.types';

interface UsersState {
  items: User[];
  loading: boolean;
  error: string | null;
  /** True once a 403 confirms the signed-in user isn't staff — UsersPanel hides entirely. */
  forbidden: boolean;
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
  forbidden: false,
};

// Rejects with { status } (not a message) so UsersPanel can special-case a 403
// by hiding the whole panel silently, same as saudi_app_react's usersSlice.
export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: { status: number } }>(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await usersApi.list();
    } catch (e: any) {
      return rejectWithValue({ status: e.response?.status ?? 0 });
    }
  }
);

export const createUser = createAsyncThunk<User, UserPayload, { rejectValue: string }>(
  'users/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await usersApi.create(payload);
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const updateUser = createAsyncThunk<
  User,
  { id: number; payload: Partial<UserPayload> },
  { rejectValue: string }
>('users/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await usersApi.update(id, payload);
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const deleteUser = createAsyncThunk<number, number, { rejectValue: string }>(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await usersApi.remove(id);
      return id;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
        state.error = null;
        state.forbidden = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        // 403 is handled silently by the component (hides the panel) — don't surface an error.
        state.forbidden = action.payload?.status === 403;
        state.error = state.forbidden ? null : 'failed_to_load_users';
      });

    builder.addCase(createUser.fulfilled, (state, { payload }) => {
      state.items.unshift(payload);
    });

    builder.addCase(updateUser.fulfilled, (state, { payload }) => {
      const idx = state.items.findIndex((u) => u.id === payload.id);
      if (idx !== -1) state.items[idx] = payload;
    });

    builder.addCase(deleteUser.fulfilled, (state, { payload: id }) => {
      state.items = state.items.filter((u) => u.id !== id);
    });
  },
});

export default usersSlice.reducer;
