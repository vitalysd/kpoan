import type { Brand, Category, Product, ProductCharacteristic } from "@prisma/client";
import { Save, Trash2 } from "lucide-react";

type ProductWithCharacteristics = Product & {
  characteristics: ProductCharacteristic[];
};

type ProductFormProps = {
  product?: ProductWithCharacteristics;
  brands: Pick<Brand, "id" | "name">[];
  categories: Pick<Category, "id" | "name">[];
  action: (formData: FormData) => Promise<void>;
  deleteAction?: () => Promise<void>;
  saved?: boolean;
};

const decimalInput = (value: { toString(): string } | number | null | undefined) =>
  value === null || value === undefined ? "" : value.toString();

export function ProductForm({
  product,
  brands,
  categories,
  action,
  deleteAction,
  saved = false,
}: ProductFormProps) {
  const characteristics = product?.characteristics
    .map((item) => `${item.name}: ${item.value}`)
    .join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form
        id="product-form"
        action={action}
        className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        {saved && (
          <p className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Изменения сохранены.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Название *</span>
            <input
              name="name"
              required
              defaultValue={product?.name ?? ""}
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Артикул / SKU</span>
            <input
              name="sku"
              defaultValue={product?.sku ?? ""}
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Slug</span>
            <input
              name="slug"
              defaultValue={product?.slug ?? ""}
              placeholder="Сгенерируется автоматически"
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Бренд *</span>
            <select
              name="brandId"
              required
              defaultValue={product?.brandId ?? ""}
              className="w-full rounded border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            >
              <option value="" disabled>
                Выберите бренд
              </option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Категория *</span>
            <select
              name="categoryId"
              required
              defaultValue={product?.categoryId ?? ""}
              className="w-full rounded border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            >
              <option value="" disabled>
                Выберите категорию
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Цена *</span>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={decimalInput(product?.price)}
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Старая цена</span>
            <input
              name="oldPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={decimalInput(product?.oldPrice)}
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Рейтинг</span>
            <input
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              defaultValue={product?.rating ?? 0}
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Отзывы</span>
            <input
              name="reviewCount"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.reviewCount ?? 0}
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Краткое описание</span>
            <textarea
              name="shortDescription"
              rows={3}
              defaultValue={product?.shortDescription ?? ""}
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Описание</span>
            <textarea
              name="description"
              rows={5}
              defaultValue={product?.description ?? ""}
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">URL изображений, по одному в строке</span>
            <textarea
              name="images"
              rows={3}
              defaultValue={product?.images.join("\n") ?? ""}
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Характеристики</span>
            <textarea
              name="characteristics"
              rows={6}
              placeholder={"Мощность: 1200 Вт\nНапряжение: 220 В"}
              defaultValue={characteristics ?? ""}
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded bg-cyan-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-700"
        >
          <Save className="h-4 w-4" />
          Сохранить
        </button>
      </form>

      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg text-slate-950">Статусы</h2>
          <div className="space-y-3">
            {[
              ["inStock", "В наличии", product?.inStock ?? true],
              ["isNew", "Новинка", product?.isNew ?? false],
              ["isPopular", "Популярный", product?.isPopular ?? false],
            ].map(([name, label, defaultChecked]) => (
              <label key={String(name)} className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  form="product-form"
                  name={String(name)}
                  type="checkbox"
                  defaultChecked={Boolean(defaultChecked)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {deleteAction && (
          <form action={deleteAction} className="rounded-lg border border-red-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-lg text-red-700">Удаление</h2>
            <p className="mb-4 text-sm text-slate-600">
              Товар будет удален вместе с характеристиками.
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Удалить товар
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}
