import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "http://localhost:4000/auth/login",
                form,
                { withCredentials: true }
            );

            navigate("/");

        } catch (err) {
            const message = err.response?.data?.message || "로그인 실패했습니다.";
            alert(message);
        }
    };

    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-sm bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">로그인</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block mb-1 text-sm font-medium">
                아이디
            </label>
            <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
            />
            </div>

            <div>
            <label className="block mb-1 text-sm font-medium">
                비밀번호
            </label>
            <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="••••••••"
                required
            />
            </div>

            <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
            로그인
            </button>
        </form>
        </div>
    </div>
    );
}
