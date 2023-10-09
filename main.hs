fn :: [Char] -> IO [Char]
fn a = do
  return a

main :: IO ()
main = fn "a" >>= putStrLn
