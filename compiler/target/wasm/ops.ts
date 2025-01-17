export enum OpCode {
  Unreachable = 0x00,
  Nop = 0x01,
  Block = 0x02,
  Loop = 0x03,
  If = 0x04,
  Br = 0x0c,
  BrIf = 0x0d,
  BrTable = 0x0e,
  Return = 0x0f,
  End = 0x0b,
  Call = 0x10,
  CallIndirect = 0x11,
  LocalGet = 0x20,
  LocalSet = 0x21,
  LocalTee = 0x22,
  GlobalGet = 0x23,
  GlobalSet = 0x24,
  Drop = 0x1a,
  Select = 0x1b,
  i32_Load = 0x28,
  i64_Load = 0x29,
  f32_Load = 0x2a,
  f64_Load = 0x2b,
  i32_Load8S = 0x2c,
  i32_Load8U = 0x2d,
  i32_Load16S = 0x2e,
  i32_Load16U = 0x2f,
  i64_Load8S = 0x30,
  i64_Load8U = 0x31,
  i64_Load16S = 0x32,
  i64_Load16U = 0x33,
  i64_Load32S = 0x34,
  i64_Load32U = 0x35,
  i32_Store = 0x36,
  i64_Store = 0x37,
  f32_Store = 0x38,
  f64_Store = 0x39,
  i32_Store8 = 0x3a,
  i32_Store16 = 0x3b,
  i64_Store8 = 0x3c,
  i64_Store16 = 0x3d,
  i64_Store32 = 0x3e,
  MemorySize = 0x3f,
  MemoryGrow = 0x40,
  i32_Const = 0x41,
  i64_Const = 0x42,
  f32_Const = 0x43,
  f64_Const = 0x44,
  i32_Eqz = 0x45,
  i32_Eq = 0x46,
  i32_Ne = 0x47,
  i32_LtS = 0x48,
  i32_LtU = 0x49,
  i32_GtS = 0x4a,
  i32_GtU = 0x4b,
  i32_LeS = 0x4c,
  i32_LeU = 0x4d,
  i32_GeS = 0x4e,
  i32_GeU = 0x4f,
  i64_Eqz = 0x50,
  i64_Eq = 0x51,
  i64_Ne = 0x52,
  i64_LtS = 0x53,
  i64_LtU = 0x54,
  i64_GtS = 0x55,
  i64_GtU = 0x56,
  i64_LeS = 0x57,
  i64_LeU = 0x58,
  i64_GeS = 0x59,
  i64_GeU = 0x5a,
  f32_Eq = 0x5b,
  f32_Ne = 0x5c,
  f32_Lt = 0x5d,
  f32_Gt = 0x5e,
  f32_Le = 0x5f,
  f32_Ge = 0x60,
  f64_Eq = 0x61,
  f64_Ne = 0x62,
  f64_Lt = 0x63,
  f64_Gt = 0x64,
  f64_Le = 0x65,
  f64_Ge = 0x66,
  i32_Clz = 0x67,
  i32_Ctz = 0x68,
  i32_Popcnt = 0x69,
  i32_Add = 0x6a,
  i32_Sub = 0x6b,
  i32_Mul = 0x6c,
  i32_DivS = 0x6d,
  i32_DivU = 0x6e,
  i32_RemS = 0x6f,
  i32_RemU = 0x70,
  i32_And = 0x71,
  i32_Or = 0x72,
  i32_Xor = 0x73,
  i32_Shl = 0x74,
  i32_ShrS = 0x75,
  i32_ShrU = 0x76,
  i32_Rotl = 0x77,
  i32_Rotr = 0x78,
  i64_Clz = 0x79,
  i64_Ctz = 0x7a,
  i64_Popcnt = 0x7b,
  i64_Add = 0x7c,
  i64_Sub = 0x7d,
  i64_Mul = 0x7e,
  i64_DivS = 0x7f,
  i64_DivU = 0x80,
  i64_RemS = 0x81,
  i64_RemU = 0x82,
  i64_And = 0x83,
  i64_Or = 0x84,
  i64_Xor = 0x85,
  i64_Shl = 0x86,
  i64_ShrS = 0x87,
  i64_ShrU = 0x88,
  i64_Rotl = 0x89,
  i64_Rotr = 0x8a,
  f32_Abs = 0x8b,
  f32_Neg = 0x8c,
  f32_Ceil = 0x8d,
  f32_Floor = 0x8e,
  f32_Trunc = 0x8f,
  f32_Nearest = 0x90,
  f32_Sqrt = 0x91,
  f32_Add = 0x92,
  f32_Sub = 0x93,
  f32_Mul = 0x94,
  f32_Div = 0x95,
  f32_Min = 0x96,
  f32_Max = 0x97,
  f32_Copysign = 0x98,
  f64_Abs = 0x99,
  f64_Neg = 0x9a,
  f64_Ceil = 0x9b,
  f64_Floor = 0x9c,
  f64_Trunc = 0x9d,
  f64_Nearest = 0x9e,
  f64_Sqrt = 0x9f,
  f64_Add = 0xa0,
  f64_Sub = 0xa1,
  f64_Mul = 0xa2,
  f64_Div = 0xa3,
  f64_Min = 0xa4,
  f64_Max = 0xa5,
  f64_Copysign = 0xa6,
  i32_Wrap_i64 = 0xa7,
  i32_Trunc_f32_S = 0xa8,
  i32_Trunc_f32_U = 0xa9,
  i32_Trunc_f64_S = 0xaa,
  i32_Trunc_f64_U = 0xab,
  i64_Extend_i32_S = 0xac,
  i64_Extend_i32_U = 0xad,
  i64_Trunc_f32_S = 0xae,
  i64_Trunc_f32_U = 0xaf,
  i64_Trunc_f64_S = 0xb0,
  i64_Trunc_f64_U = 0xb1,
  f32_Convert_i32_S = 0xb2,
  f32_Convert_i32_U = 0xb3,
  f32_Convert_i64_S = 0xb4,
  f32_Convert_i64_U = 0xb5,
  f32_Demote_f64 = 0xb6,
  f64_Convert_i32_S = 0xb7,
  f64_Convert_i32_U = 0xb8,
  f64_Convert_i64_S = 0xb9,
  f64_Convert_i64_U = 0xba,
  f64_Promote_f32 = 0xbb,
  i32_Reinterpret_f32 = 0xbc,
  i64_Reinterpret_f64 = 0xbd,
  f32_Reinterpret_i32 = 0xbe,
  f64_Reinterpret_i64 = 0xbf,
  i32_Extend8_S = 0xc0,
  i32_Extend16_S = 0xc1,
  i64_Extend8_S = 0xc2,
  i64_Extend16_S = 0xc3,
  i64_Extend32_S = 0xc4,
  TruncSatPrefix = 0xfc,
}
