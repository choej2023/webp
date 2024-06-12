import './css/TopBar.css'

export default function TopBar({formData, handleChange, handleSubmit}) {

    const formFields = [
        {label: '이름', type: 'text', name: 'name'},
        {label: '체크인', type: 'date', name: 'checkIn'},
        {label: '체크아웃', type: 'date', name: 'checkOut'},
        {label: '주소', type: 'text', name: 'address'}
    ];

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <fieldset className="searchForm">
                    {formFields.map((field, index) => (
                        <div key={index} className="opt">
                            <label htmlFor={field.name}>{field.label}</label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                            />
                        </div>
                    ))}
                    <div className="opt">
                        <label htmlFor="type">유형</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="">선택</option>
                            <option value="캠핑">캠핑</option>
                            <option value="글램핑">글램핑</option>
                            <option value="캐러밴">캐러밴</option>
                            <option value="펜션">펜션</option>
                        </select>
                    </div>

                    <button type="submit" className="searchButton">검색</button>
                </fieldset>

            </form>
        </div>
    )
}