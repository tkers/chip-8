let input = null
let stack = null

// tick ' (reads from input stream)
input = "$04 $02     define test ' swap ;     test dup"
stack_exp = "04 [xt:dup] 02"
stack_actual = "04 02 [xt:swap] [xt:swap]"
err = "tick should read from input stream instead"

// immediate tick ['] (reads "from def")
inptu = "$04 $02     define test2 ['] swap ;     test2 dup"
stack_exp = "04 02 [xt:swap] [xt:swap]"
