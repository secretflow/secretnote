Program(
  1 :: IO -> PYU(alice),
  2 :: IO -> PYU(bob),
  3 :: IO -> PYU(carol),
  4 :: 1 -> SPU(alice, bob, carol),
  5 :: 2 -> SPU(alice, bob, carol),
  6 :: 3 -> SPU(alice, bob, carol),
  7 :: 4 -> 5 -> 6 -> SPU(alice, bob, carol),
  8 :: 7 -> PYU(alice),
  9 :: 8 -> IO,
)

Program(
  1 = Move(IO, PYU(alice)),
  2 = Move(IO, PYU(bob)),
  3 = Move(IO, PYU(carol)),
  4 = Move(1, SPU(alice, bob, carol)),
  5 = Move(2, SPU(alice, bob, carol)),
  6 = Move(3, SPU(alice, bob, carol)),
  7 = Move(4, 5, 6, SPU(alice, bob, carol)),
  8 = Move(7, PYU(alice)),
  9 = Move(8, IO),
)

Program(
  1 == IO -> PYU(alice),
  2 == IO -> PYU(bob),
  3 == IO -> PYU(carol),
  4 == IO -> PYU(alice) -> SPU(alice, bob, carol),
  5 == IO -> PYU(bob) -> SPU(alice, bob, carol),
  6 == IO -> PYU(carol) -> SPU(alice, bob, carol),
  7 == IO -> PYU(alice) -> SPU(alice, bob, carol) -> IO -> PYU(bob) -> SPU(alice, bob, carol) -> IO -> PYU(carol) -> SPU(alice, bob, carol) -> SPU(alice, bob, carol),
  8 == IO -> PYU(alice) -> SPU(alice, bob, carol) -> IO -> PYU(bob) -> SPU(alice, bob, carol) -> IO -> PYU(carol) -> SPU(alice, bob, carol) -> SPU(alice, bob, carol) -> PYU(alice),
  9 == IO -> PYU(alice) -> SPU(alice, bob, carol) -> IO -> PYU(bob) -> SPU(alice, bob, carol) -> IO -> PYU(carol) -> SPU(alice, bob, carol) -> SPU(alice, bob, carol) -> PYU(alice) -> IO,
)

Program(
  IO
  -> PYU(alice)
  -> SPU(alice, bob, carol)
  -> IO
  -> PYU(bob)
  -> SPU(alice, bob, carol)
  -> IO
  -> PYU(carol)
  -> SPU(alice, bob, carol)
  -> SPU(alice, bob, carol)
  -> PYU(alice)
  -> IO,
)
