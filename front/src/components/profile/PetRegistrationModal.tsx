import { useState } from "react"
import "./styles/PetRegistrationModal.scss"
import defaultPetIcon from "../../assets/img/defaulticon.jpg"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { PetInputData, petInputSchema } from "./schema/petInput"
import { useToast } from "../../utils/toast/useToast"
import { useAuth } from "../../hooks/auth/useAuth"
type PetRegistrationModalProps = {
  onClose: () => void
}

const PetRegistrationModal = ({ onClose }: PetRegistrationModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PetInputData>({
    resolver: zodResolver(petInputSchema),
  })
  const {user} = useAuth()
  const {showToast} = useToast()

  

  const [petImage, setPetImage] = useState<string | ArrayBuffer | undefined>(defaultPetIcon)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPetImage(reader.result || undefined)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRegister = async (data: PetInputData) => {
    if (!petImage) {
      showToast("ペットの画像を選択してください", "error")
      return
    }
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("type", data.type)
    formData.append("birthDay", data.birthDay)

    if (user && user.id) {
      formData.append("userId", user.id);
    } else {
      showToast("ユーザー情報が取得できません", "error");
      return;
    }
  
    const fileInput = document.getElementById("pet-image-upload") as HTMLInputElement
    if (fileInput.files?.length) {
      formData.append("image", fileInput.files[0])
    } else {
      showToast("画像を選択してください", "error")
      return
    }
  
    try {
      const res = await fetch("http://localhost:3000/pets/new", {
        method: "POST",
        body: formData, // `Content-Type` は `fetch` 側で自動設定
      })
  
      if (!res.ok) {
        throw new Error("ペット登録に失敗しました")
      }
  
      showToast("ペットが登録されました", "success")
      onClose()
    } catch (err) {
      console.error("❌ ペット登録エラー:", err)
      showToast("登録に失敗しました", "error")
    }
  }
  

  const handleValidationError = () => {
    if (errors.name) {
      showToast(errors.name.message || "名前を入力してください", "error")
    }
    if (errors.type) {
      showToast(errors.type.message || "種類を入力してください", "error")
    }
    if (errors.birthDay) {
      showToast(errors.birthDay.message || "生年月日を正しく入力してください", "error")
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-left">
          <h3>アイコン登録</h3>
          <label htmlFor="pet-image-upload" className="image-upload-label">
            <img src={petImage as string} alt="ペットアイコン" className="pet-icon" />
            <input 
              id="pet-image-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              style={{ display: "none" }} 
            />
          </label>
          <p>アイコンをクリックして画像を選択</p>
        </div>

        {/* 🔹 右半分：情報入力 */}
        <div className="modal-right">
          <h2>ペット登録</h2>
          <form onSubmit={handleSubmit(handleRegister, handleValidationError)}>
            <input type="text" placeholder="ペットの名前" {...register("name")} />

            <input type="text" placeholder="品種" {...register("type")} />

            <input type="text" placeholder="生年月日（YYYY/MM/DD）" {...register("birthDay")} />

            <button className="submit-button" type="submit">
              登録
            </button>
            <button className="close-button" type="button" onClick={onClose}>
              閉じる
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PetRegistrationModal
