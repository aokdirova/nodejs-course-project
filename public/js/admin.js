const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

  const elementToDelete = btn.closest("article");

  fetch(`/admin/product/${prodId}`, {
    method: "POST",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      elementToDelete.remove();
    })
    .catch((err) => console.log(err));
};
