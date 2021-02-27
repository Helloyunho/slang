(module
    (func (param f64 f64) (result f64)
        local.get 0
        local.get 1
        f64.add
        f64.const 10
        f64.add
    )
    (export "add" (func 0))
)