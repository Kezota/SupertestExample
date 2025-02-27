export const getProduct = async (req, res) => {
  console.log("getProduct", req.body);

  const products = await prisma.product.findMany();
  return res
    .status(200)
    .json({ message: "Products retrieved successfully", data: products });
};

export const createProduct = async (req, res) => {
  console.log("createProduct", req.body);

  const { name, stock } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  if (!stock) {
    return res.status(400).json({ message: "Stock is required" });
  }
  const createdProduct = await prisma.product.create({
    data: {
      name: name,
      stock: stock,
    },
  });
  return res.status(200).json({
    message: "Product created successfully",
    data: createdProduct,
  });
};

export const deleteProduct = async (req, res) => {
  console.log("deleteProduct", req.body);

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  const deletedProduct = await prisma.product.delete({
    where: {
      name: name,
    },
  });
  return res.status(200).json({
    message: "Product deleted successfully",
    data: deletedProduct,
  });
};
